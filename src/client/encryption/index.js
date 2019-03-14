import JSEncrypt from 'jsencrypt';
import aesjs from 'aes-js';
import { encryptSymmetricInWorker, decryptSymmetricInWorker } from './worker';
import { generateRandomKey, textToBytes } from '../helper';

export const generateAsymmetricKeyPair = (keySize = 1024) => {
  const crypt = new JSEncrypt({ default_key_size: keySize });
  const keys = crypt.getKey();
  return {
    privateKey: keys.getPrivateKey(),
    publicKey: keys.getPublicKey()
  };
};

export const encryptAsymmetric = (publicKey, actualText) => {
  const crypt = new JSEncrypt();
  crypt.setPublicKey(publicKey);
  return crypt.encrypt(actualText);
};

export const decryptAsymmetric = (privateKey, encryptedText) => {
  const crypt = new JSEncrypt();
  crypt.setPrivateKey(privateKey);
  return crypt.decrypt(encryptedText);
};

export const generateSymmetricKey = () => textToBytes(generateRandomKey(16));

export const encryptSymmetric = async (key, actualData) => {
  let encryptedData;

  if (window.Worker) {
    encryptedData = await encryptSymmetricInWorker(key, actualData);
  } else {
    encryptedData = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5)).encrypt(actualData);
  }

  return encryptedData;
};

export const decryptSymmetric = async (key, encryptedData) => {
  let decryptedData;

  if (window.Worker) {
    decryptedData = await decryptSymmetricInWorker(key, encryptedData);
  } else {
    decryptedData = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5)).decrypt(encryptedData);
  }

  return decryptedData;
};
