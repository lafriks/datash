import aesjs from 'aes-js';

const charSet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz*&-%/!?*+=()';

export const generateRandomKey = (length) => {
  const ln = charSet.length;
  let key = '';

  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * (ln - 1));
    key += charSet.substring(idx, idx + 1);
  }

  return key;
};

export const textToBytes = text => aesjs.utils.utf8.toBytes(text);

export const bytesToText = bytes => aesjs.utils.utf8.fromBytes(bytes);
