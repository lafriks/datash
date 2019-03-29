import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import uuid from 'uuid';
import {
  Upload, Icon, Input, message, Checkbox
} from 'antd';
import './index.css';
import ShareActions from '../ShareActions';
import {
  formatRecipientId, blobToArrayBuffer, bytesToHumanReadableString, makeZip, isWebRTCSupported, updateProgress
} from '../../helper';
import { sendBtnDefaultText, MaxDataSizeCanSendAtOnce, RecipientIdMaxLength } from '../../constants';
import globalStates from '../../global-states';
import {
  encryptSymmetric,
  encryptAsymmetric,
  bytesToText,
  encryptObjectSymmetric
} from '../../encryption';
import { openRTCPeerConnection, sendToDataChannel } from '../../webrtc';

const { Dragger } = Upload;

class FilePanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fileList: [],
      isSharing: false,
      sendBtnText: sendBtnDefaultText,
      sendAsZip: false
    };

    this.onChangeRecipientVal = this.onChangeRecipientVal.bind(this);
    this.onReset = this.onReset.bind(this);
    this.onShare = this.onShare.bind(this);
    this.onChangeSendAsZip = this.onChangeSendAsZip.bind(this);
  }

  onChangeRecipientVal(evt) {
    const { onChangeRecipientId } = this.props;
    const newRecipientId = formatRecipientId(evt.target.value || '');

    if (newRecipientId.length <= RecipientIdMaxLength) {
      onChangeRecipientId(newRecipientId);
    }
  }

  onChangeSendAsZip(evt) {
    this.setState({
      sendAsZip: evt.target.checked
    });
  }

  onReset() {
    const { onChangeRecipientId } = this.props;
    onChangeRecipientId('');

    this.setState({
      fileList: [],
    });
  }

  onShare() {
    const { fileList } = this.state;
    const { recipientId } = this.props;

    if (!fileList.length) {
      message.error('Please select file to send');
      return;
    }

    if (recipientId === '') {
      message.error('Please enter recipient ID');
      return;
    }

    const totalSize = fileList.reduce((acc, current) => acc + (current.size || 0), 0);
    if (totalSize > MaxDataSizeCanSendAtOnce) {
      message.error(`Maximum ${bytesToHumanReadableString(MaxDataSizeCanSendAtOnce)} can be sent at once`);
      return;
    }

    this.setState({
      isSharing: true,
      sendBtnText: 'Fetching meta...'
    });

    const progressId = uuid();

    axios.get(`/api/v1/clients/${encodeURIComponent(recipientId)}/meta`)
      .then(({ data: { publicKey, isWebRTCSupported: isPeerWebRTCSupported } }) => {
        if (isWebRTCSupported() && isPeerWebRTCSupported) {
          return this.shareOverWebRTC(progressId, fileList, recipientId);
        }
        return this.shareOverHttp(progressId, fileList, publicKey, recipientId);
      })
      .catch((err) => {
        let msg;
        if (err.response) {
          if (err.response.status === 404) {
            msg = `Recipient ${recipientId} not found`;
          } else {
            msg = `Error: ${err.response.status} ${err.response.statusText}`;
          }
        } else {
          msg = err.message || String(err);
        }
        message.error(msg);
        updateProgress(progressId, recipientId, msg, true);

        this.setState({
          isSharing: false,
          sendBtnText: sendBtnDefaultText
        });
      });
  }

  async shareOverHttp(progressId, fileList, publicKey, recipientId) {
    this.setState({
      sendBtnText: 'Archiving...'
    });
    updateProgress(progressId, recipientId, 'Archiving...');

    const resolvedFileList = await this.resolveFileList(fileList);

    this.setState({
      sendBtnText: 'Encrypting...'
    });
    updateProgress(progressId, recipientId, 'Encrypting...');

    const fileArrayBuffers = await Promise.all(resolvedFileList.map(file => Promise.all([
      { name: file.name, mimeType: file.type || 'application/octet-stream', size: `${file.size}` },
      blobToArrayBuffer(file)
    ])));

    const encFiles = await Promise.all(fileArrayBuffers.map(([fileInfo, arrayBuffer]) => Promise.all([
      encryptObjectSymmetric(globalStates.symmetricEncKey, fileInfo),
      encryptSymmetric(globalStates.symmetricEncKey, new Uint8Array(arrayBuffer))
    ])));

    const encKey = encryptAsymmetric(publicKey, bytesToText(globalStates.symmetricEncKey));

    this.setState({
      sendBtnText: 'Sending...'
    });
    updateProgress(progressId, recipientId, 'Downloading...');

    await axios.post(`/api/v1/clients/${encodeURIComponent(globalStates.clientId)}/share`, {
      progressId,
      to: recipientId,
      encKey,
      data: encFiles.map(([encFileInfo, encFileData]) => ({
        type: 'file',
        name: encFileInfo.name,
        mimeType: encFileInfo.mimeType,
        size: encFileInfo.size,
        encContent: encFileData
      }))
    });

    this.setState({
      isSharing: false,
      sendBtnText: sendBtnDefaultText
    });
  }

  async shareOverWebRTC(progressId, fileList, recipientId) {
    const { dataChannel } = await openRTCPeerConnection(recipientId);

    this.setState({
      sendBtnText: 'Archiving...'
    });
    updateProgress(progressId, recipientId, 'Archiving...');

    const resolvedFileList = await this.resolveFileList(fileList);
    const data = resolvedFileList.map(file => ({
      meta: {
        type: 'file',
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
      },
      content: file
    }));

    this.setState({
      sendBtnText: 'Sending...'
    });
    updateProgress(progressId, recipientId, 'Downloading...');

    await sendToDataChannel(progressId, dataChannel, data);

    this.setState({
      isSharing: false,
      sendBtnText: sendBtnDefaultText
    });
  }

  async resolveFileList(fileList) {
    const { sendAsZip } = this.state;

    if (sendAsZip) {
      fileList = [await makeZip(fileList)];
    }

    return fileList;
  }

  render() {
    const { style, recipientId } = this.props;
    const {
      fileList, isSharing, sendBtnText, sendAsZip
    } = this.state;

    const draggerProps = {
      multiple: true,
      disabled: isSharing,

      onRemove: (file) => {
        this.setState((state) => {
          const index = state.fileList.indexOf(file);
          const newFileList = state.fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
          };
        });
      },

      beforeUpload: (file) => {
        this.setState(state => ({
          fileList: [...state.fileList, file],
        }));
        return false;
      },
      fileList,
    };

    return (
      <div className="file-panel" style={style}>
        <div className="file-panel-wrapper">
          <div className="inputs-container">
            <div className="file-dragger-container">
              <div className="file-dragger-wrapper">
                <Dragger {...draggerProps}>
                  <p className="ant-upload-drag-icon">
                    <Icon type="inbox" />
                  </p>
                  <p className="ant-upload-text">Click or drag file to this area to send</p>
                  <p className="ant-upload-hint">
                  Support for a single or bulk upload
                  </p>
                </Dragger>
              </div>
            </div>
            <div className="send-as-zip-checkbox-container">
              <Checkbox onChange={this.onChangeSendAsZip} checked={sendAsZip}>Send as Zip</Checkbox>
            </div>
            <div className="input-recipient-id-container">
              <Input
                className="input-recipient-id"
                addonBefore="Recipient ID"
                placeholder="Enter recipient ID"
                allowClear
                value={recipientId}
                onChange={this.onChangeRecipientVal}
                disabled={isSharing}
                onPressEnter={() => this.onShare()}
              />
            </div>
          </div>
          <ShareActions
            onReset={this.onReset}
            onShare={this.onShare}
            loading={isSharing}
            sendBtnText={sendBtnText}
          />
        </div>
      </div>
    );
  }
}

FilePanel.propTypes = {
  style: PropTypes.instanceOf(Object).isRequired,
  recipientId: PropTypes.string.isRequired,
  onChangeRecipientId: PropTypes.func.isRequired
};

export default FilePanel;
