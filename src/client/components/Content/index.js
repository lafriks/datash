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
      selectedTabKey: 'file',
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
    this.setState({ selectedTabKey: key });
  }

  render() {
    const { selectedTabKey, recipientId } = this.state;
    const { receivedData } = this.props;

    return (
      <div className="content">
        <div className="control-panel">
          <Card
            tabList={tabList}
            activeTabKey={selectedTabKey}
            className="control-panel-wrapper"
            title={`USER ID - ${globalStates.clientId}`}
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
};

export default Content;
