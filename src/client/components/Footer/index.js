import React from 'react';
import { Icon, Button } from 'antd';
import './index.css';

const Footer = () => (
  <div className="footer">
    <Icon type="copyright" size="small" />
    <span>2019</span>
    <span style={{ marginLeft: 5 }}>
      <Button
        className="copyright-link"
        type="default"
        href="https://rousan.io"
        target="_blank"
      >
        Rousan Ali
      </Button>
    </span>
  </div>
);

export default Footer;
