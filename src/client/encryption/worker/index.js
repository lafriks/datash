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
  ensureWorkerIsRunning();

  const reqId = uuid();
  requestMap.set(reqId, res);

  worker.postMessage({
    reqId,
    type: 'symmetric-encrypt',
    data: { key, actualData }
  });
});

export const decryptSymmetricInWorker = (key, encryptedData) => new Promise((res, rej) => {
  ensureWorkerIsRunning();

  const reqId = uuid();
  requestMap.set(reqId, res);

  worker.postMessage({
    reqId,
    type: 'symmetric-decrypt',
    data: { key, encryptedData }
  });
});
