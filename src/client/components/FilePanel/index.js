import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Upload, Icon, Input } from 'antd';
import './index.css';
import ShareActions from '../ShareActions';

const { Dragger } = Upload;

class FilePanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fileList: [],
      uploading: false,
    };

    this.onReset = this.onReset.bind(this);
    this.onShare = this.onShare.bind(this);
  }

  onReset() {

  }

  onShare() {
    const { fileList } = this.state;
    fileList.forEach((file) => {
      console.log(file.type);
    });
  }

  render() {
    const { style } = this.props;
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
            />
          </div>
          <ShareActions
            style={{ marginTop: 40 }}
            onReset={this.onReset}
            onShare={this.onShare}
          />
        </div>
      </div>
    );
  }
}

FilePanel.propTypes = {
  style: PropTypes.instanceOf(Object).isRequired
};

export default FilePanel;
