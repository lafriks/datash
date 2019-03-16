import React, { Component } from 'react';
import './index.css';
import Loader from '../Loader';
import Content from '../Content';
import { sendWS } from '../../helper';
import globalStates, { updateGlobalStates } from '../../global-states';
import {
  generateAsymmetricKeyPair,
  generateSymmetricKey,
  decryptAsymmetric,
  decryptSymmetric,
  textToBytes,
  bytesToText
} from '../../encryption';

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

    const decKey = textToBytes(decryptAsymmetric(globalStates.privateKey, encKey));

    const promises = dataArr.map((datum) => {
      const { type, name, encContent } = datum;
      return Promise.all([type, name, decryptSymmetric(decKey, encContent)]);
    });
    Promise.all(promises)
      .then((resVals) => {
        resVals.forEach(([type, name, decContent]) => {
          console.log(type, name);
          // inform data is recieved and decrypting
          // handle file and text, use bytesToTextAsync for text
          // console.log(type, name, bytesToText(decContent));
        });
      })
      .catch((err) => {
        console.error(err);
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
