import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './index.css';
import { Input } from 'antd';
import ShareActions from '../ShareActions';

const { TextArea } = Input;

class TextPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      textAreaVal: ''
    };

    this.onChangeRecipientVal = this.onChangeRecipientVal.bind(this);
    this.onChangeTextAreaVal = this.onChangeTextAreaVal.bind(this);
    this.onReset = this.onReset.bind(this);
    this.onShare = this.onShare.bind(this);
  }

  onChangeRecipientVal(evt) {
    const { onChangeRecipientId } = this.props;
    onChangeRecipientId(evt.target.value);
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

    console.log(recipientId, textAreaVal);
  }

  render() {
    const { style, recipientId } = this.props;
    const { textAreaVal } = this.state;

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
            />
            <Input
              className="input-recipient-id"
              addonBefore="Recipient ID"
              placeholder="Enter recipient ID"
              allowClear
              value={recipientId}
              onChange={this.onChangeRecipientVal}
            />
          </div>
          <ShareActions
            style={{ marginTop: 40 }}
            onReset={this.onReset}
            onShare={this.onShare}
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
