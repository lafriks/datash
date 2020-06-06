import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Clipboard from 'clipboard';
import { saveAs } from 'file-saver';
import {
  List, Empty, Avatar, Button, message
} from 'antd';
import './index.css';
import emptyImage from './empty.png';
import { MaxRecItemLength } from '../../constants';
import { extractFileExt, extractFileNameWithoutExt, bytesToHumanReadableString } from '../../helper';

class ReceivedPanel extends Component {
  constructor(props) {
    super(props);

    // this.downloaderRef = React.createRef();
    this.onClickDownload = this.onClickDownload.bind(this);
  }

  componentDidMount() {
    /* eslint-disable-next-line */
    new Clipboard('.btn-copy-text');
  }

  itemAvatar(item) {
    const mimeType = item.mimeType || 'text/plain';
    let icon;

    switch (mimeType) {
      case 'text/plain':
        icon = 'file-text';
        break;
      case 'image/jpeg':
        icon = 'file-jpg';
        break;
      case 'application/pdf':
        icon = 'file-pdf';
        break;
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        icon = 'file-word';
        break;
      case 'application/vnd.ms-excel':
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        icon = 'file-excel';
        break;
      case 'application/vnd.ms-powerpoint':
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        icon = 'file-ppt';
        break;
      default:
        icon = 'file';
        break;
    }

    return <Avatar size="small" icon={icon} style={{ backgroundColor: 'transparent', color: '#1890ff' }} />;
  }

  itemDownloadCopyAction(item) {
    const style = { color: '#1890ff', border: 'none' };

    if (item.type === 'text') {
      return (
        <Button
          className="btn-copy-text"
          title="Click to copy"
          icon="copy"
          style={style}
          data-clipboard-text={item.content}
          onClick={() => message.success('Copied to clipboard!')}
        />
      );
    }

    return (
      <Button
        className="btn-download"
        title="Click to download"
        onClick={() => this.onClickDownload(item)}
        icon="download"
        style={style}
      />
    );
  }

  itemFileSizeAction(item) {
    const size = item.type === 'file' ? (item.size || 0) : item.content.length;
    return <span className="file-size-label">{bytesToHumanReadableString(size)}</span>;
  }

  itemDeleteAction(item) {
    const { onDeleteReceivedData } = this.props;

    return (
      <Button
        className="btn-delete"
        title="Click to delete"
        onClick={() => onDeleteReceivedData(item)}
        icon="delete"
        style={{ color: '#1890ff', border: 'none' }}
      />
    );
  }

  onClickDownload(item) {
    if (item.type === 'text') {
      return;
    }

    if (window.Android) {
      this.saveFileInAndroid(item);
    } else {
      saveAs(item.content, item.name || 'file');
    }

    // const downloaderLink = this.downloaderRef.current;
    // const objUrl = URL.createObjectURL(item.content);
    // downloaderLink.href = objUrl;
    // downloaderLink.download = item.name || 'file';
    // downloaderLink.click();
    // setTimeout(() => {
    //   URL.revokeObjectURL(objUrl);
    // }, 60 * 1000);
  }

  saveFileInAndroid(item) {
    window.Android.onStartFileDownload(item.id, item.from, item.name || 'file', `${item.size}`, item.mimeType);

    const reader = new FileReader();

    reader.onload = () => {
      const dataUrl = reader.result;
      const base64 = dataUrl.split(',')[1];
      window.Android.onCompleteFileDownload(item.id, base64);
    };

    reader.readAsDataURL(item.content);
  }

  getItemName(item) {
    if (item.type === 'file') {
      const { name } = item;
      const ext = extractFileExt(name);
      const fnWithoutExt = extractFileNameWithoutExt(name);
      const maxLn = MaxRecItemLength - ext.length;

      return fnWithoutExt.length > maxLn ? `${fnWithoutExt.slice(0, maxLn)}...${ext}` : name;
    }

    const { content } = item;
    return content.length > MaxRecItemLength ? `${content.slice(0, MaxRecItemLength)}...` : content;
  }

  render() {
    const { style, receivedData } = this.props;

    return (
      <div className="received-panel" style={style}>
        <div className="received-panel-wrapper">
          <List
            locale={{ emptyText: <Empty image={emptyImage} description="No Data Received" /> }}
            itemLayout="horizontal"
            dataSource={receivedData}
            renderItem={item => (
              <List.Item
                className="received-item"
                actions={[
                  this.itemFileSizeAction(item),
                  this.itemDownloadCopyAction(item),
                  this.itemDeleteAction(item)
                ]}
              >
                <List.Item.Meta
                  avatar={this.itemAvatar(item)}
                  title={<span className="item-name">{this.getItemName(item)}</span>}
                  description={<span className="item-from">{item.from}</span>}
                />
              </List.Item>
            )}
            rowKey={item => item.id}
          />
        </div>
        {/* <a
          ref={this.downloaderRef}
          href="#"
          style={{ visibility: 'hidden' }}
        /> */}
      </div>
    );
  }
}

ReceivedPanel.propTypes = {
  style: PropTypes.instanceOf(Object).isRequired,
  receivedData: PropTypes.instanceOf(Array).isRequired,
  onDeleteReceivedData: PropTypes.func.isRequired
};

export default ReceivedPanel;
