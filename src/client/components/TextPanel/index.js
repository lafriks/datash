import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './index.css';
import { Input, Button } from 'antd';
import ShareActions from '../ShareActions';

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
          <ShareActions
            style={{ marginTop: 30 }}
            onReset={() => console.log('reset')}
            onShare={() => console.log('shared')}
          />
        </div>

      </div>
    );
  }
}

TextPanel.propTypes = {
  style: PropTypes.instanceOf(Object).isRequired
};

export default TextPanel;
