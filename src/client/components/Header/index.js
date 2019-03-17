import React from 'react';
import {
  Row, Col, Avatar, Button
} from 'antd';
import './index.css';
import logoImage from './logo.png';
import { appName, githubURL } from '../../constants';

const menuItems = [
  {
    label: 'About',
    href: '/about'
  },
  {
    label: 'How it works',
    href: '/how-it-works'
  }
];

const Header = () => (
  <div className="header">
    <Row>
      <Col span={8} className="left-section">
        <Avatar src={logoImage} size="small" />
        <span className="app-name-label">{appName.toUpperCase().split('').join(' ')}</span>
      </Col>
      <Col span={16} className="right-section">
        {menuItems.map(menuItem => (
          <Button
            key={menuItem.label}
            className="menu-item"
            type="default"
            href={menuItem.href}
          >
            {menuItem.label}
          </Button>
        ))}
        <Button
          className="menu-item github-link"
          icon="github"
          type="default"
          href={githubURL}
          target="_blank"
        />
      </Col>
    </Row>
  </div>
);

export default Header;
