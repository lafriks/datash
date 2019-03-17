import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import {
  Upload, Icon, Input, message
} from 'antd';
import './index.css';
import ShareActions from '../ShareActions';
import { formatRecipientId, blobToArrayBuffer, bytesToHumanReadableString } from '../../helper';
import { sendBtnDefaultText, MaxDataSizeCanSendAtOnce } from '../../constants';
import globalStates from '../../global-states';
import {
  encryptSymmetric,
  encryptAsymmetric,
  bytesToText,
  encryptObjectSymmetric
} from '../../encryption';

const { Dragger } = Upload;

class FilePanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fileList: [],
      isSharing: false,
      sendBtnText: sendBtnDefaultText
    };

    this.onChangeRecipientVal = this.onChangeRecipientVal.bind(this);
    this.onReset = this.onReset.bind(this);
    this.onShare = this.onShare.bind(this);
  }

  onChangeRecipientVal(evt) {
    const { onChangeRecipientId } = this.props;
    onChangeRecipientId(formatRecipientId(evt.target.value || ''));
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
      sendBtnText: 'Encrypting...'
    });

    axios.get(`/api/v1/clients/${encodeURIComponent(recipientId)}/publicKey`)
      .then(({ data: { publicKey } }) => Promise.all([
        publicKey,
        Promise.all(fileList.map(file => Promise.all([
          { name: file.name, mimeType: file.type || 'application/octet-stream', size: `${file.size}` },
          blobToArrayBuffer(file)
        ])))
      ]))
      .then(([publicKey, arrayBufferResults]) => Promise.all([
        encryptAsymmetric(publicKey, bytesToText(globalStates.symmetricEncKey)),
        Promise.all(
          arrayBufferResults.map(([fileInfo, arrayBuffer]) => Promise.all(
            [
              encryptObjectSymmetric(globalStates.symmetricEncKey, fileInfo),
              encryptSymmetric(globalStates.symmetricEncKey, new Uint8Array(arrayBuffer))
            ]
          ))
        )
      ]))
      .then(([encKey, encFiles]) => {
        this.setState({
          sendBtnText: 'Sending...'
        });

        return axios.post(
          `/api/v1/clients/${encodeURIComponent(globalStates.clientId)}/share`,
          {
            to: recipientId,
            encKey,
            data: encFiles.map(([encFileInfo, encFileData]) => ({
              type: 'file',
              name: encFileInfo.name,
              mimeType: encFileInfo.mimeType,
              size: encFileInfo.size,
              encContent: encFileData
            }))
          }
        );
      })
      .then(() => {
        message.success(`Sent to recipient ${recipientId}`);
        this.setState({
          isSharing: false,
          sendBtnText: sendBtnDefaultText
        });
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

        this.setState({
          isSharing: false,
          sendBtnText: sendBtnDefaultText
        });
      });
  }

  render() {
    const { style, recipientId } = this.props;
    const { fileList, isSharing, sendBtnText } = this.state;

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
