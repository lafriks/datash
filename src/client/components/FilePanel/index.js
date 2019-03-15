import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './index.css';

class FilePanel extends Component {
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
      <div className="file-panel" style={style}>
      FilePanel
      </div>
    );
  }
}

FilePanel.propTypes = {
  style: PropTypes.instanceOf(Object).isRequired
};

export default FilePanel;
