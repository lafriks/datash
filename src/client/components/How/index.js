import React from 'react';
import { Steps } from 'antd';
import './index.css';

const { Step } = Steps;

const processSteps = [
  {
    title: 'Generate Keys',
    description: 'On the startup, it generates public/private key-pair and a symmetric key'
  },
  {
    title: 'Assign ID',
    description: 'Server assigns an unique, short and memorable ID'
  },
  {
    title: 'Send',
    description: 'Hit the send button'
  },
  {
    title: 'Encrypt with Symmetric key',
    description: 'Encrypts data with the symmetric key'
  },
  {
    title: 'Encrypt Symmetric Key',
    description: 'Encrypts the symmetric key with the recipient public key'
  },
  {
    title: 'Upload Data',
    description: 'Uploads encrypted data and encrypted symmetric key to server'
  },
  {
    title: 'Send to Recipient',
    description: 'Server searches the recipient and send the encrypted data'
  },
  {
    title: 'Receive Data',
    description: 'Recipient device receives encrypted data'
  },
  {
    title: 'Decrypt Symmetric Key',
    description: 'Recipient decrypts the encrypted symmetric Key with private key'
  },
  {
    title: 'Decrypt Data',
    description: 'Decrypts the encrypted data with symmetric Key'
  },
  {
    title: 'Save Data',
    description: 'Finally, it saves data in decrypted form'
  },
  {
    title: 'Download or Copy',
    description: 'Download or copy the received data'
  }
];

const About = () => (
  <div className="about">
    <h2>How does it work ?</h2>
    <p>
      On the startup of the application, it creates
      <span className="highlight">public/private key-pair</span>
      , a
      <span className="highlight">symmetric key</span>
      and stores those on your browser. After that the server assigns a
      <span className="highlight">4 digit ID</span>
      for your current session as an identification entity.
    </p>

    <p>If we decompose the whole process into several steps it would be like below:</p>
    <div className="steps-container">
      <Steps direction="vertical" progressDot>
        {
          processSteps.map(step => (
            <Step
              key={step.title}
              title={step.title}
              description={step.description}
              status="finish"
            />
          ))
        }
      </Steps>
    </div>
  </div>
);

export default About;
