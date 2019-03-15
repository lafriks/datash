import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Upload, Icon, Input } from 'antd';
import './index.css';
import ShareActions from '../ShareActions';
import { formatRecipientId } from '../../helper';

const { Dragger } = Upload;

class FilePanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fileList: [],
      uploading: false,
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

    console.log(recipientId);

    fileList.forEach((file) => {
      console.log(file.name);
    });
  }

  render() {
    const { style, recipientId } = this.props;
    const { uploading, fileList } = this.state;

    const draggerProps = {
      multiple: true,
      disabled: uploading,

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
            />
          </div>
          <ShareActions
            style={{ marginTop: 40 }}
            onReset={this.onReset}
            onShare={this.onShare}
            loading={uploading}
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
