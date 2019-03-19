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
    case 'text-to-bytes':
      onTextToBytes(reqId, data);
      break;
    case 'bytes-to-text':
      onBytesToText(reqId, data);
      break;
    default:
      break;
  }
});

const onSymmetricEncrypt = (reqId, data) => {
  try {
    const { key, actualData } = data;

    const aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
    const base64EncryptedData = base64Arraybuffer.encode(aesCtr.encrypt(actualData).buffer);
    postResponse(reqId, base64EncryptedData);
  } catch (err) {
    postResponse(reqId, err);
  }
};

const onSymmetricDecrypt = (reqId, data) => {
  try {
    const { key, base64EncryptedData } = data;

    const aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
    const decryptedData = aesCtr.decrypt(new Uint8Array(base64Arraybuffer.decode(base64EncryptedData)));
    postResponse(reqId, decryptedData);
  } catch (err) {
    postResponse(reqId, err);
  }
};

const onTextToBytes = (reqId, data) => {
  try {
    postResponse(reqId, aesjs.utils.utf8.toBytes(data));
  } catch (err) {
    postResponse(reqId, err);
  }
};

const onBytesToText = (reqId, data) => {
  try {
    postResponse(reqId, aesjs.utils.utf8.fromBytes(data));
  } catch (err) {
    postResponse(reqId, err);
  }
};

const postResponse = (reqId, resp) => {
  let respData;

  if (resp instanceof Error) {
    respData = { error: resp.message || String(resp), data: null };
  } else {
    respData = { error: null, data: resp };
  }

  self.postMessage({
    reqId,
    data: respData
  });
};
