import React, { Component } from 'react';
import { notification, Icon } from 'antd';
import uuid from 'uuid/v4';
import './index.css';
import Loader from '../Loader';
import Content from '../Content';
import { sendWS, arrayBufferToBlob } from '../../helper';
import globalStates, { updateGlobalStates } from '../../global-states';
import {
  generateAsymmetricKeyPair,
  generateSymmetricKey,
  decryptAsymmetric,
  textToBytes,
  decryptObjectSymmetric,
  bytesToText
} from '../../encryption';
import {
  cacheClientId,
  getCachedClientId,
  cacheSessionId,
  getCachedSessionId,
  cacheAsymmetricKeys,
  getCachedAsymmetricKeys,
} from '../../caching';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      loadingText: 'Loading...',
      receivedData: [],
      selectedTabKey: 'file'
    };

    this.onSelectTab = this.onSelectTab.bind(this);
    this.onDeleteReceivedData = this.onDeleteReceivedData.bind(this);
  }

  onSelectTab(newTabKey) {
    this.setState({
      selectedTabKey: newTabKey
    });
  }

  onDeleteReceivedData(item) {
    const { receivedData } = this.state;
    const newReceivedData = receivedData.slice();

    const itemIdx = newReceivedData.findIndex(elem => elem.id === item.id);
    if (itemIdx !== -1) {
      newReceivedData.splice(itemIdx, 1);
      this.setState({
        receivedData: newReceivedData
      });
    }
  }

  componentDidMount() {
    this.setState({
      loadingText: 'Generating encryption keys...',
    });

    const asymmetricKeys = getCachedAsymmetricKeys() || generateAsymmetricKeyPair();
    const symmetricEncKey = generateSymmetricKey();

    updateGlobalStates({
      publicKey: asymmetricKeys.publicKey,
      privateKey: asymmetricKeys.privateKey,
      symmetricEncKey
    });

    cacheAsymmetricKeys(asymmetricKeys);

    this.setupWSConn();
  }

  setupWSConn() {
    const ws = new WebSocket(this.wsUrl());
    updateGlobalStates({ ws });

    ws.addEventListener('open', () => {
      sendWS(ws, {
        type: 'client-id',
        data: {
          publicKey: globalStates.publicKey,
          cachedClientId: getCachedClientId(),
          cachedSessionId: getCachedSessionId()
        }
      });
    });

    ws.addEventListener('error', (err) => {
      console.error(err);
      ws.close();
    });

    ws.addEventListener('close', () => {
      setTimeout(() => {
        this.setupWSConn();
      }, 5000);
    });

    ws.addEventListener('message', (evt) => {
      try {
        const data = JSON.parse(evt.data);
        this.handleWSMessage(data.type, data.data);
      } catch (err) {
        console.error(err);
      }
    });
  }

  wsUrl() {
    let protocol;
    if (location.protocol === 'https:') {
      protocol = 'wss:';
    } else {
      protocol = 'ws:';
    }

    return `${protocol}//${location.host}/connect`;
  }

  handleWSMessage(type, data) {
    switch (type) {
      case 'heartbeat':
        this.onMessageHeartbeat(data);
        break;
      case 'client-id':
        this.onMessageClientId(data);
        break;
      case 'share':
        this.onMessageShare(data);
        break;
      case 'progress':
        this.onMessageProgress(data);
        break;
      default:
        break;
    }
  }

  onMessageHeartbeat() {
    sendWS(globalStates.ws, {
      type: 'heartbeat',
      data: 'Yes, I am alive'
    });
  }

  onMessageClientId(data) {
    const { clientId, sessionId } = data;

    globalStates.clientId = clientId;
    this.setState({
      loaded: true
    });

    cacheClientId(clientId);
    cacheSessionId(sessionId);
  }

  onMessageShare(data) {
    const {
      progressId, from, encKey, data: dataArr, sharingConfirmationId
    } = data;

    if (sharingConfirmationId) {
      sendWS(globalStates.ws, {
        type: 'share-confirm',
        data: sharingConfirmationId
      });
    }

    if (!from || !encKey || !dataArr) {
      return;
    }

    const notificationId = progressId;
    notification.open({
      key: notificationId,
      duration: 0,
      message: `Received data from ${from}`,
      description: 'Decrypting...',
      icon: <Icon type="loading" style={{ color: '#1890ff' }} />
    });

    const decKey = textToBytes(decryptAsymmetric(globalStates.privateKey, encKey));

    Promise.all(dataArr.map(datum => Promise.all([
      datum.type,
      decryptObjectSymmetric(
        decKey,
        {
          name: datum.name,
          mimeType: datum.mimeType,
          size: datum.size,
          content: datum.encContent
        }
      )
    ])))
      .then(resVals => Promise.all(resVals.map(([type, {
        name, mimeType, size, content
      }]) => Promise.all([
        type,
        name ? bytesToText(name) : null,
        mimeType ? bytesToText(mimeType) : null,
        size ? +bytesToText(size) : null,
        type === 'text' ? bytesToText(content) : arrayBufferToBlob(content.buffer)
      ]))))
      .then((resVals) => {
        this.setState(state => ({
          receivedData: [
            ...state.receivedData,
            ...resVals.map(([type, name, mimeType, size, content]) => ({
              id: uuid(),
              from,
              type,
              name,
              mimeType,
              size,
              content
            }))
          ],
          selectedTabKey: 'received'
        }));

        notification.open({
          key: notificationId,
          duration: 4.5,
          message: 'Saved',
          description: '',
          icon: <Icon type="check-circle" style={{ color: '#1890ff' }} />
        });
      })
      .catch((err) => {
        notification.open({
          key: notificationId,
          duration: 4.5,
          message: 'Error',
          description: err.message || String(err),
          icon: <Icon type="close-circle" style={{ color: 'rgb(245, 38, 50)' }} />
        });
      });
  }

  onMessageProgress(data) {
    const {
      progressId, from, message, error
    } = data;

    notification.open({
      key: progressId,
      duration: !error ? 0 : 4.5,
      message: !error ? `Receiving data from ${from}` : 'Error',
      description: message,
      icon: !error ? (<Icon type="loading" style={{ color: '#1890ff' }} />)
        : (<Icon type="close-circle" style={{ color: 'rgb(245, 38, 50)' }} />)
    });
  }

  render() {
    const {
      loaded, loadingText, receivedData, selectedTabKey
    } = this.state;

    return (
      <div className="app">
        {
          loaded
            ? (
              <Content
                receivedData={receivedData}
                onDeleteReceivedData={this.onDeleteReceivedData}
                selectedTabKey={selectedTabKey}
                onSelectTab={this.onSelectTab}
              />
            )
            : (<Loader text={loadingText} />)
        }
      </div>
    );
  }
}

export default App;
