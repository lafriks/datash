import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './index.css';

class ReceivedPanel extends Component {
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
      <div className="received-panel" style={style}>
      ReceivedPanel
      </div>
    );
  }
}

ReceivedPanel.propTypes = {
  style: PropTypes.instanceOf(Object).isRequired
};

export default ReceivedPanel;
