import React from 'react';
import PropTypes from 'prop-types';
import { Spin } from 'antd';
import './index.css';

const Loader = ({ text }) => (
  <div className="loader">
    <div className="indicator-container">
      <Spin tip={text} className="indicator" />
    </div>
  </div>
);

Loader.propTypes = {
  text: PropTypes.string.isRequired
};

export default Loader;
