import React, { Component } from 'react';
import axios from 'axios';
import { Input, Button } from 'antd';
import './index.css';
import globalStates from '../../global-states';
import {
  encryptSymmetric,
  encryptAsymmetric
} from '../../encryption';
import { textToBytes, bytesToText } from '../../helper';

const { TextArea } = Input;

class Content extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isSharingDone: true
    };

    this.textAreaRef = React.createRef();
    this.clientIdRef = React.createRef();
    this.onShareData = this.onShareData.bind(this);
  }

  componentDidMount() {
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

  render() {
    const { isSharingDone } = this.state;

    return (
      <div className="content">
        <h3>{globalStates.clientId}</h3>
        <div>
          <TextArea ref={this.textAreaRef} placeholder="Your text to share" rows={4} style={{ marginBottom: 15 }} />
          <Input ref={this.clientIdRef} placeholder="Recipient Id" style={{ marginBottom: 15 }} />
          <Button onClick={this.onShareData} loading={!isSharingDone}>Share</Button>
        </div>
      </div>
    );
  }
}

export default Content;
