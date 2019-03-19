import uuid from 'uuid/v4';
import Worker from './script.worker';

let worker;
const requestMap = new Map();

const ensureWorkerIsRunning = () => {
  if (!worker) {
    worker = new Worker();
    worker.addEventListener('message', onWorkerMessage);
  }
};

const onWorkerMessage = (event) => {
  const { reqId, data } = event.data;

  if (requestMap.has(reqId)) {
    requestMap.get(reqId)(data);
    requestMap.delete(reqId);
  }
};

export const encryptSymmetricInWorker = (key, actualData) => new Promise((res, rej) => {
  const reqId = registerWorkerRequest(res, rej);

  worker.postMessage({
    reqId,
    type: 'symmetric-encrypt',
    data: { key, actualData }
  });
});

export const decryptSymmetricInWorker = (key, base64EncryptedData) => new Promise((res, rej) => {
  const reqId = registerWorkerRequest(res, rej);

  worker.postMessage({
    reqId,
    type: 'symmetric-decrypt',
    data: { key, base64EncryptedData }
  });
});

export const textToBytesInWorker = text => new Promise((res, rej) => {
  const reqId = registerWorkerRequest(res, rej);

  worker.postMessage({
    reqId,
    type: 'text-to-bytes',
    data: text
  });
});

export const bytesToTextInWorker = bytes => new Promise((res, rej) => {
  const reqId = registerWorkerRequest(res, rej);

  worker.postMessage({
    reqId,
    type: 'bytes-to-text',
    data: bytes
  });
});

const registerWorkerRequest = (resFn, rejFn) => {
  ensureWorkerIsRunning();

  const reqId = uuid();
  requestMap.set(reqId, (resp) => {
    if (resp.error) {
      rejFn(new Error(resp.error));
    } else {
      resFn(resp.data);
    }
  });

  return reqId;
};
