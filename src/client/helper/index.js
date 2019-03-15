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

export const sendWS = (wsConn, data) => {
  wsConn.send(JSON.stringify(data));
};

export const displayThis = (condition, display = 'block') => (condition ? display : 'none');

export const displayStyle = (condition, display) => ({ display: displayThis(condition, display) });

export const formatRecipientId = val => val.trim().replace(/[^\d]+/, '');
