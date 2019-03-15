import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import './index.css';

const ShareActions = ({ style, onReset, onShare }) => (
  <div className="share-actions" style={style}>
    <Button className="btn-reset" onClick={onReset}>Reset</Button>
    <Button className="btn-send" type="primary" icon="lock" onClick={onShare}>Send Securely</Button>
  </div>
);

ShareActions.propTypes = {
  style: PropTypes.instanceOf(Object).isRequired,
  onReset: PropTypes.func.isRequired,
  onShare: PropTypes.func.isRequired
};

export default ShareActions;
