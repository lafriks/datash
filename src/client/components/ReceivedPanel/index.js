import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './index.css';

class ReceivedPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render() {
    const { style, receivedData } = this.props;

    return (
      <div className="received-panel" style={style}>
        <ul>
          { receivedData.map(data => <li key={data.id}>{data.name}</li>) }
        </ul>
      </div>
    );
  }
}

ReceivedPanel.propTypes = {
  style: PropTypes.instanceOf(Object).isRequired,
  receivedData: PropTypes.instanceOf(Array).isRequired
};

export default ReceivedPanel;
