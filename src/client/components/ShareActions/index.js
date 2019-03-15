import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import './index.css';

const ShareActions = ({
  style, onReset, onShare, loading, sendBtnText
}) => (
  <div className="share-actions" style={style}>
    <Button disabled={loading} className="btn-reset" onClick={onReset}>Reset</Button>
    <Button loading={loading} className="btn-send" type="primary" icon="lock" onClick={onShare}>{sendBtnText}</Button>
  </div>
);

ShareActions.propTypes = {
  style: PropTypes.instanceOf(Object).isRequired,
  onReset: PropTypes.func.isRequired,
  onShare: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  sendBtnText: PropTypes.string.isRequired
};

export default ShareActions;
