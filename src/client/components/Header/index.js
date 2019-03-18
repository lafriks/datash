import React from 'react';
import { Link } from 'react-router-dom';
import {
  Row, Col, Avatar, Button
} from 'antd';
import './index.css';
import logoImage from './logo.png';
import { appName, githubURL } from '../../constants';

const menuItems = [
  {
    label: 'Home',
    href: '/'
  },
  {
    label: 'About',
    href: '/about'
  }
];

const Header = () => (
  <div className="header">
    <Row>
      <Col span={8} className="left-section">
        <Link to="/" className="logo-link-wrapper">
          <Avatar src={logoImage} size="small" />
          <span className="app-name-label">{appName.toUpperCase().split('').join(' ')}</span>
        </Link>
      </Col>
      <Col span={16} className="right-section">
        {menuItems.map(menuItem => (
          <Link
            className="menu-item"
            key={menuItem.label}
            to={menuItem.href}
          >
            <Button
              className="menu-item-btn"
              type="default"
            >
              {menuItem.label}
            </Button>
          </Link>
        ))}
        <Button
          className="menu-item-github-link"
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
