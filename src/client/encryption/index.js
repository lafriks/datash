import JSEncrypt from 'jsencrypt';
import aesjs from 'aes-js';
import base64Arraybuffer from 'base64-arraybuffer';
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
  let base64EncryptedData;

  if (window.Worker) {
    base64EncryptedData = await encryptSymmetricInWorker(key, actualData);
  } else {
    base64EncryptedData = base64Arraybuffer.encode(
      new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5)).encrypt(actualData).buffer
    );
  }

  return base64EncryptedData;
};

export const decryptSymmetric = async (key, base64EncryptedData) => {
  let decryptedData;

  if (window.Worker) {
    decryptedData = await decryptSymmetricInWorker(key, base64EncryptedData);
  } else {
    decryptedData = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5)).decrypt(
      new Uint8Array(base64Arraybuffer.decode(base64EncryptedData))
    );
  }

  return decryptedData;
};
