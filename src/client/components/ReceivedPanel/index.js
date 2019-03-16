import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Clipboard from 'clipboard';
import {
  List, Empty, Avatar, Button, message
} from 'antd';
import './index.css';
import emptyImage from './empty.png';

class ReceivedPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };

    this.downloaderRef = React.createRef();
    this.onClickDownload = this.onClickDownload.bind(this);
  }

  componentDidMount() {
    /* eslint-disable-next-line */
    new Clipboard('.btn-to-copy-text');
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

  itemAction(item) {
    const style = { color: '#1890ff', border: 'none' };

    if (item.type === 'text') {
      return (
        <Button
          className="btn-to-copy-text"
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
        title="Click to download"
        onClick={() => this.onClickDownload(item)}
        icon="download"
        style={style}
      />
    );
  }

  onClickDownload(item) {
    if (item.type === 'text') {
      return;
    }

    const downloaderLink = this.downloaderRef.current;
    const objUrl = URL.createObjectURL(item.content);
    downloaderLink.href = objUrl;
    downloaderLink.download = item.name || 'file';
    downloaderLink.click();
    URL.revokeObjectURL(objUrl);
  }

  getItemName(item) {
    if (item.type === 'file') {
      return item.name;
    }

    const { content } = item;
    return content.length > 60 ? `${content.slice(0, 60)}...` : content;
  }

  render() {
    const { style, receivedData } = this.props;

    return (
      <div className="received-panel" style={style}>
        <div className="received-panel-wrapper">
          <List
            locale={{ emptyText: <Empty image={emptyImage} description="No Received Data" /> }}
            itemLayout="horizontal"
            dataSource={receivedData}
            renderItem={item => (
              <List.Item actions={[this.itemAction(item)]}>
                <List.Item.Meta
                  avatar={this.itemAvatar(item)}
                  description={<span className="item-name">{this.getItemName(item)}</span>}
                />
              </List.Item>
            )}
            rowKey={item => item.id}
          />
        </div>
        <a
          ref={this.downloaderRef}
          href="#"
          style={{ visibility: 'hidden' }}
        />
      </div>
    );
  }
}

ReceivedPanel.propTypes = {
  style: PropTypes.instanceOf(Object).isRequired,
  receivedData: PropTypes.instanceOf(Array).isRequired
};

export default ReceivedPanel;
