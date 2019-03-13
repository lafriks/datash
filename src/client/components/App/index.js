import React, { Component } from 'react';
import './index.css';
import LogoImage from './logo.png';

export default class App extends Component {
  state = { id: null };

  componentDidMount() {
    fetch('/api/v1/generate')
      .then(res => res.json())
      .then(data => this.setState({ id: data.id }));
  }

  render() {
    const { id } = this.state;
    return (
      <div>
        { id }
        <img src={LogoImage} alt="logo" width="45" />
      </div>
    );
  }
}
