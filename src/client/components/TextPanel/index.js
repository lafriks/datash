import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Input, message } from 'antd';
import './index.css';
import ShareActions from '../ShareActions';
import {
  encryptSymmetric,
  encryptAsymmetric,
  textToBytesAsync,
  bytesToText
} from '../../encryption';
import { formatRecipientId } from '../../helper';
import globalStates from '../../global-states';
import { sendBtnDefaultText } from '../../constants';

const { TextArea } = Input;

class TextPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      textAreaVal: '',
      isSharing: false,
      sendBtnText: sendBtnDefaultText
    };

    this.onChangeRecipientVal = this.onChangeRecipientVal.bind(this);
    this.onChangeTextAreaVal = this.onChangeTextAreaVal.bind(this);
    this.onReset = this.onReset.bind(this);
    this.onShare = this.onShare.bind(this);
  }

  onChangeRecipientVal(evt) {
    const { onChangeRecipientId } = this.props;
    onChangeRecipientId(formatRecipientId(evt.target.value || ''));
  }

  onChangeTextAreaVal(evt) {
    this.setState({
      textAreaVal: evt.target.value
    });
  }

  onReset() {
    const { onChangeRecipientId } = this.props;
    onChangeRecipientId('');

    this.setState({
      textAreaVal: ''
    });
  }

  onShare() {
    const { textAreaVal } = this.state;
    const { recipientId } = this.props;

    if (textAreaVal === '') {
      message.error('Please enter text to send');
      return;
    }

    if (recipientId === '') {
      message.error('Please enter recipient ID');
      return;
    }

    this.setState({
      isSharing: true,
      sendBtnText: 'Encrypting...'
    });

    axios.get(`/api/v1/clients/${encodeURIComponent(recipientId)}/publicKey`)
      .then(({ data: { publicKey } }) => Promise.all([
        publicKey,
        textToBytesAsync(textAreaVal)
      ]))
      .then(([publicKey, dataBytes]) => {
        const encKey = encryptAsymmetric(publicKey, bytesToText(globalStates.symmetricEncKey));
        return Promise.all([
          encKey,
          encryptSymmetric(globalStates.symmetricEncKey, dataBytes)
        ]);
      })
      .then(([encKey, encData]) => {
        this.setState({
          sendBtnText: 'Sending...'
        });

        axios.post(
          `/api/v1/clients/${encodeURIComponent(globalStates.clientId)}/share`,
          {
            to: recipientId,
            encKey,
            data: [
              {
                type: 'text',
                name: null,
                encContent: encData
              }
            ]
          }
        );
      })
      .then(() => {
        message.success(`Sent to recipient ${recipientId}`);
        this.setState({
          isSharing: false,
          sendBtnText: sendBtnDefaultText
        });
      })
      .catch((err) => {
        let msg;
        if (err.response) {
          if (err.response.status === 404) {
            msg = `Recipient ${recipientId} not found`;
          } else {
            msg = `Error: ${err.response.status} ${err.response.statusText}`;
          }
        } else {
          msg = err.message || String(err);
        }
        message.error(msg);

        this.setState({
          isSharing: false,
          sendBtnText: sendBtnDefaultText
        });
      });
  }

  render() {
    const { style, recipientId } = this.props;
    const { textAreaVal, isSharing, sendBtnText } = this.state;

    return (
      <div className="text-panel" style={style}>
        <div className="text-panel-wrapper">
          <div className="inputs-container">
            <TextArea
              value={textAreaVal}
              className="input-textarea"
              autosize={false}
              placeholder="Paste or write your text to send"
              onChange={this.onChangeTextAreaVal}
              disabled={isSharing}
            />
            <Input
              className="input-recipient-id"
              addonBefore="Recipient ID"
              placeholder="Enter recipient ID"
              allowClear
              value={recipientId}
              onChange={this.onChangeRecipientVal}
              disabled={isSharing}
            />
          </div>
          <ShareActions
            style={{ marginTop: 40 }}
            onReset={this.onReset}
            onShare={this.onShare}
            loading={isSharing}
            sendBtnText={sendBtnText}
          />
        </div>

      </div>
    );
  }
}

TextPanel.propTypes = {
  style: PropTypes.instanceOf(Object).isRequired,
  recipientId: PropTypes.string.isRequired,
  onChangeRecipientId: PropTypes.func.isRequired
};

export default TextPanel;
