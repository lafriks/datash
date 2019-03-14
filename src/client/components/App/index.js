import React, { Component } from 'react';
import './index.css';
import Loader from '../Loader';
import Content from '../Content';
import { sendWS } from '../../helper';
import { generateAsymmetricKeyPair, generateSymmetricKey } from '../../encryption';

const globalData = window.globalData = {
  publicKey: null,
  privateKey: null,
  symmetricEncKey: null,
  ws: null,
  clientId: null
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      loadingText: 'Loading...'
    };
  }

  componentDidMount() {
    this.setState({
      loadingText: 'Generating encryption keys...'
    });

    const asymmetricKeys = generateAsymmetricKeyPair();
    const symmetricEncKey = generateSymmetricKey();

    globalData.publicKey = asymmetricKeys.publicKey;
    globalData.privateKey = asymmetricKeys.privateKey;
    globalData.symmetricEncKey = symmetricEncKey;

    this.setupWSConn();
  }

  setupWSConn() {
    const ws = new WebSocket(this.wsUrl());
    globalData.ws = ws;

    ws.addEventListener('open', () => {
      sendWS(ws, {
        type: 'client-id',
        data: globalData.publicKey
      });
    });

    ws.addEventListener('error', (err) => {
      console.error(err);

      if (ws.readyState === WebSocket.CLOSED) {
        setTimeout(() => {
          this.setupWSConn();
        }, 5000);
      }
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
        console.log(err);
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
      default:
        break;
    }
  }

  onMessageClientId(data) {
    globalData.clientId = data;
    this.setState({
      loaded: true
    });
  }

  render() {
    const { loaded, loadingText } = this.state;

    return (
      <div className="app">
        {
        loaded
          ? (<Content />)
          : (<Loader text={loadingText} />)
      }
      </div>
    );
  }
}

export default App;
