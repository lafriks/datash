import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './index.css';
import { Input, Button } from 'antd';

const { TextArea } = Input;

class TextPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  componentDidMount() {
  }

  render() {
    const { style } = this.props;

    return (
      <div className="text-panel" style={style}>
        <div className="text-panel-wrapper">
          <div className="inputs-container">
            <TextArea
              className="input-textarea"
              autosize={false}
              placeholder="Paste or write your text to send"
            />
            <Input
              className="input-recipient-id"
              addonBefore="Recipient ID"
              placeholder="Enter recipient ID"
              allowClear
            />
          </div>
          <div className="action-container">
            <Button className="btn-reset">Reset</Button>
            <Button className="btn-send" type="primary" icon="lock">Send Securely</Button>
          </div>
        </div>

      </div>
    );
  }
}

TextPanel.propTypes = {
  style: PropTypes.instanceOf(Object).isRequired
};

export default TextPanel;
