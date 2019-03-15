import React, { Component } from 'react';
import axios from 'axios';
import { Card } from 'antd';
import './index.css';
import TextPanel from '../TextPanel';
import FilePanel from '../FilePanel';
import ReceivedPanel from '../ReceivedPanel';
import globalStates from '../../global-states';
import {
  encryptSymmetric,
  encryptAsymmetric
} from '../../encryption';
import { textToBytes, bytesToText, displayStyle } from '../../helper';

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
      isSharingDone: true,
      selectedTabKey: 'text',
      recipientId: ''
    };

    this.textAreaRef = React.createRef();
    this.clientIdRef = React.createRef();
    this.onShareData = this.onShareData.bind(this);

    this.onTabChange = this.onTabChange.bind(this);
    this.onChangeRecipientId = this.onChangeRecipientId.bind(this);
  }

  onChangeRecipientId(newVal) {
    this.setState({
      recipientId: newVal
    });
  }

  onShareData() {
    const data = this.textAreaRef.current.textAreaRef.value;
    const clientId = this.clientIdRef.current.input.value.trim();

    if (data === '' || clientId === '') {
      return;
    }

    this.setState({
      isSharingDone: false
    });

    axios.get(`/api/v1/clients/${encodeURIComponent(clientId)}/publicKey`)
      .then(({ data: { publicKey } }) => {
        const encKey = encryptAsymmetric(publicKey, bytesToText(globalStates.symmetricEncKey));
        return Promise.all([
          encKey,
          encryptSymmetric(globalStates.symmetricEncKey, textToBytes(data))
        ]);
      })
      .then(([encKey, encData]) => axios.post(
        `/api/v1/clients/${encodeURIComponent(globalStates.clientId)}/share`,
        {
          to: clientId,
          encKey,
          data: [
            {
              type: 'text',
              name: null,
              encContent: encData
            }
          ]
        }
      ))
      .then(() => {
        this.setState({
          isSharingDone: true
        });
        console.log('sent');
      })
      .catch((err) => {
        this.setState({
          isSharingDone: true
        });
        console.error(err);
      });
  }

  onTabChange = (key) => {
    this.setState({ selectedTabKey: key });
  }

  render() {
    const { selectedTabKey, recipientId } = this.state;

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
              <ReceivedPanel style={displayStyle(selectedTabKey === 'received')} />
            </div>
          </Card>
        </div>
      </div>
    );
  }
}

export default Content;
