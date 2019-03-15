import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './index.css';
import { Input } from 'antd';

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
        <TextArea
          rows={20}
          autosize={false}
          style={{ resize: 'none' }}
          placeholder="Here paste or write your text to share"
        />
      </div>
    );
  }
}

TextPanel.propTypes = {
  style: PropTypes.instanceOf(Object).isRequired
};

export default TextPanel;
