import React from 'react';
import { Icon } from 'antd';
import './index.css';

const Footer = () => {
  if (window.Android) {
    return (<span />);
  }

  return (
    <div className="footer">

      <div>
        <Icon type="copyright" size="small" />
        <span>2019</span>
        <span style={{ marginLeft: 5 }}>
          Datash
        </span>
      </div>
    </div>
  );
};

export default Footer;
