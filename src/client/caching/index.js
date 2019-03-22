import { encryptAsymmetric, decryptAsymmetric } from '../encryption';

export const cacheClientId = (clientId) => {
  localStorage.setItem('clientId', clientId);
};

export const getCachedClientId = () => localStorage.getItem('clientId');

export const cacheSessionId = (sessionId) => {
  localStorage.setItem('sessionId', sessionId);
};

export const getCachedSessionId = () => localStorage.getItem('sessionId');

export const cacheAsymmetricKeys = (keys) => {
  localStorage.setItem('asymmetricKeys', JSON.stringify(keys));
};

export const getCachedAsymmetricKeys = () => {
  const cachedKeys = localStorage.getItem('asymmetricKeys');
  if (!cachedKeys) { return null; }

  try {
    const keyPair = JSON.parse(cachedKeys);
    return isValidAsymmetricKeys(keyPair) ? keyPair : null;
  } catch (err) {
    return null;
  }
};

const isValidAsymmetricKeys = (keyPair) => {
  const { publicKey, privateKey } = keyPair;

  if (!publicKey || !privateKey) {
    return false;
  }

  const encryptTest = encryptAsymmetric(publicKey, 'test');
  if (!encryptTest) {
    return false;
  }

  const decryptTest = decryptAsymmetric(privateKey, encryptTest);
  if (!decryptTest) {
    return false;
  }

  return true;
};

export const cacheRecipientId = (recipientId) => {
  localStorage.setItem('recipientId', recipientId);
};

export const getCachedRecipientId = () => localStorage.getItem('recipientId');
