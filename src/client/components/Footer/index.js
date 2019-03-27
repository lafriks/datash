import React from 'react';
import { Icon, Button } from 'antd';
import './index.css';

const Footer = () => (
  <div className="footer">
    <div style={{ marginBottom: 5 }}>
      <a
        href="https://www.producthunt.com/posts/datash?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-datash"
        rel="noopener noreferrer"
        target="_blank"
      >
        <img
          src={`https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=148864&theme=light&t=${Date.now()}`}
          alt="Datash - Send and receive files with end-to-end encryption | Product Hunt Embed"
          style={{ width: 200 }}
        />
      </a>
    </div>
    <div>
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
  </div>
);

export default Footer;
