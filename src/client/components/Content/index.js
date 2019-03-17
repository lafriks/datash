import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card } from 'antd';
import './index.css';
import TextPanel from '../TextPanel';
import FilePanel from '../FilePanel';
import ReceivedPanel from '../ReceivedPanel';
import globalStates from '../../global-states';
import { displayStyle } from '../../helper';

const tabList = [
  {
    key: 'text',
    tab: 'Send Text',
  },
  {
    key: 'file',
    tab: 'Send File',
  },
  {
    key: 'received',
    tab: 'Data Received',
  }
];

class Content extends Component {
  constructor(props) {
    super(props);

    this.state = {
      recipientId: ''
    };

    this.onTabChange = this.onTabChange.bind(this);
    this.onChangeRecipientId = this.onChangeRecipientId.bind(this);
  }

  onChangeRecipientId(newVal) {
    this.setState({
      recipientId: newVal
    });
  }

  onTabChange = (key) => {
    const { onSelectTab } = this.props;
    onSelectTab(key);
  }

  render() {
    const { recipientId } = this.state;
    const { receivedData, onDeleteReceivedData, selectedTabKey } = this.props;

    return (
      <div className="content">
        <div className="control-panel">
          <Card
            tabList={tabList}
            activeTabKey={selectedTabKey}
            className="control-panel-wrapper"
            title={(
              <span>
                <span className="client-id-label">MY ID</span>
                <span className="client-id">{globalStates.clientId.split('').join(' ')}</span>
              </span>
            )}
            onTabChange={this.onTabChange}
          >
            <div className="tab-content-wrapper">
              <TextPanel
                style={displayStyle(selectedTabKey === 'text')}
                recipientId={recipientId}
                onChangeRecipientId={this.onChangeRecipientId}
              />
              <FilePanel
                style={displayStyle(selectedTabKey === 'file')}
                recipientId={recipientId}
                onChangeRecipientId={this.onChangeRecipientId}
              />
              <ReceivedPanel
                style={displayStyle(selectedTabKey === 'received')}
                receivedData={receivedData}
                onDeleteReceivedData={onDeleteReceivedData}
              />
            </div>
          </Card>
        </div>
      </div>
    );
  }
}

Content.propTypes = {
  receivedData: PropTypes.instanceOf(Array).isRequired,
  onDeleteReceivedData: PropTypes.func.isRequired,
  selectedTabKey: PropTypes.string.isRequired,
  onSelectTab: PropTypes.func.isRequired
};

export default Content;
