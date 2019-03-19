export const cacheClientId = (clientId) => {
  localStorage.setItem('clientId', clientId);
};

export const getCachedClientId = () => localStorage.getItem('clientId');

export const cacheAsymmetricKeys = (keys) => {
  localStorage.setItem('asymmetricKeys', JSON.stringify(keys));
};

export const getCachedAsymmetricKeys = () => {
  const cachedKeys = localStorage.getItem('asymmetricKeys');
  if (!cachedKeys) { return null; }

  try {
    const keyPair = JSON.parse(cachedKeys);
    return keyPair.publicKey && keyPair.privateKey ? keyPair : null;
  } catch (err) {
    return null;
  }
};
