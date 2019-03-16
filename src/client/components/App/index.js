import React, { Component } from 'react';
import { message, notification } from 'antd';
import uuid from 'uuid/v4';
import './index.css';
import Loader from '../Loader';
import Content from '../Content';
import { sendWS } from '../../helper';
import globalStates, { updateGlobalStates } from '../../global-states';
import {
  generateAsymmetricKeyPair,
  generateSymmetricKey,
  decryptAsymmetric,
  textToBytes,
  decryptObjectSymmetric,
  bytesToText
} from '../../encryption';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      loadingText: 'Loading...',
      receivedData: []
    };
  }

  componentDidMount() {
    this.setState({
      loadingText: 'Generating encryption keys...',
    });

    const asymmetricKeys = generateAsymmetricKeyPair();
    const symmetricEncKey = generateSymmetricKey();

    updateGlobalStates({
      publicKey: asymmetricKeys.publicKey,
      privateKey: asymmetricKeys.privateKey,
      symmetricEncKey
    });

    this.setupWSConn();
  }

  setupWSConn() {
    const ws = new WebSocket(this.wsUrl());
    updateGlobalStates({ ws });

    ws.addEventListener('open', () => {
      sendWS(ws, {
        type: 'client-id',
        data: globalStates.publicKey
      });
    });

    ws.addEventListener('error', (err) => {
      console.error(err);

      if (ws.readyState === WebSocket.CLOSED) {
        setTimeout(() => {
          this.setupWSConn();
        }, 2000);
      }
    });

    ws.addEventListener('close', () => {
      setTimeout(() => {
        this.setupWSConn();
      }, 2000);
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
    return `ws://${location.host}/connect`;
  }

  handleWSMessage(type, data) {
    switch (type) {
      case 'client-id':
        this.onMessageClientId(data);
        break;
      case 'share':
        this.onMessageShare(data);
        break;
      default:
        break;
    }
  }

  onMessageClientId(data) {
    globalStates.clientId = data;
    this.setState({
      loaded: true
    });
  }

  onMessageShare(data) {
    const { from, encKey, data: dataArr } = data;
    if (!from || !encKey || !dataArr) {
      return;
    }

    notification.open({
      message: 'New data received',
      description: 'Please wait, data is decrypting...'
    });

    const decKey = textToBytes(decryptAsymmetric(globalStates.privateKey, encKey));

    Promise.all(dataArr.map(datum => Promise.all(
      [datum.type, decryptObjectSymmetric(decKey, { name: datum.name, content: datum.encContent })]
    )))
      .then((resVals) => {
        this.setState(state => ({
          receivedData: [...state.receivedData, ...resVals.map(([type, { name: nameBytes, content }]) => {
            const name = nameBytes ? bytesToText(nameBytes) : null;
            return {
              id: uuid(),
              type,
              name,
              content
            };
          })]
        }));
      })
      .catch((err) => {
        const msg = err.message || String(err);
        message.error(msg);
      });
  }

  render() {
    const { loaded, loadingText, receivedData } = this.state;

    return (
      <div className="app">
        {
          loaded
            ? (<Content receivedData={receivedData} />)
            : (<Loader text={loadingText} />)
        }
      </div>
    );
  }
}

export default App;
