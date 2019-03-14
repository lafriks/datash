import aesjs from 'aes-js';
import base64Arraybuffer from 'base64-arraybuffer';

self.addEventListener('message', (event) => {
  const { reqId, type, data } = event.data;

  switch (type) {
    case 'symmetric-encrypt':
      onSymmetricEncrypt(reqId, data);
      break;
    case 'symmetric-decrypt':
      onSymmetricDecrypt(reqId, data);
      break;
    default:
      break;
  }
});

const onSymmetricEncrypt = (reqId, data) => {
  const { key, actualData } = data;

  const aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
  const base64EncryptedData = base64Arraybuffer.encode(aesCtr.encrypt(actualData).buffer);

  self.postMessage({
    reqId,
    data: base64EncryptedData
  });
};

const onSymmetricDecrypt = (reqId, data) => {
  const { key, base64EncryptedData } = data;

  const aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
  const decryptedData = aesCtr.decrypt(new Uint8Array(base64Arraybuffer.decode(base64EncryptedData)));

  self.postMessage({
    reqId,
    data: decryptedData
  });
};
