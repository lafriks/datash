import aesjs from 'aes-js';

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
  const encryptedData = aesCtr.encrypt(actualData);

  self.postMessage({
    reqId,
    data: encryptedData
  });
};

const onSymmetricDecrypt = (reqId, data) => {
  const { key, encryptedData } = data;

  const aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
  const decryptedData = aesCtr.decrypt(encryptedData);

  self.postMessage({
    reqId,
    data: decryptedData
  });
};
