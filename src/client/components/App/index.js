import React, { Component } from 'react';
import './index.css';
import LogoImage from './logo.png';
import * as helper from '../../helper';
import { encryptSymmetric, decryptSymmetric, generateSymmetricKey } from '../../encryption';

export default class App extends Component {
  state = { id: null };

  componentDidMount() {
    fetch('/api/v1/generate')
      .then(res => res.json())
      .then(data => this.setState({ id: data.id }));

    const key = generateSymmetricKey();
    encryptSymmetric(key, helper.textToBytes('I love nodejs'))
      .then(data => decryptSymmetric(key, data))
      .then((data) => {
        console.log(helper.bytesToText(data));
      });
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
