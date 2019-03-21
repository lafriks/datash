const WebSocket = require('ws');
const uuid = require('uuid/v4');
const logger = require('../logger');
const { sendWS } = require('../helper');

const charSet = '0123456789';
const connMap = global.connMap = new Map();
const sharingConfirmationMap = global.sharingConfirmationMap = new Map();

const handleWSConn = (wsConn, req) => {
  logger.info(`WS ${req.connection.remoteAddress}`);

  wsConn.on('message', (message) => {
    try {
      message = JSON.parse(message);
      handleMessage(wsConn, message.type, message.data);
    } catch (err) {
      logger.error(err);
    }
  });

  wsConn.on('close', () => {
    logger.info(`Closed ${wsConn.clientId}`);
    disposeConn(wsConn);
  });

  wsConn.on('error', (err) => {
    logger.error(err);
    wsConn.terminate();
    disposeConn(wsConn);
  });

  sendHeartbeat(wsConn, 'Are you alive?');
};

const disposeConn = (wsConn) => {
  const { clientId } = wsConn;

  if (!connMap.has(clientId)) {
    return;
  }

  const wsConns = connMap.get(clientId);
  const connIdx = wsConns.findIndex(elem => elem === wsConn);
  if (connIdx !== -1) {
    wsConns.splice(connIdx, 1);
  }

  if (!wsConns.length) {
    connMap.delete(clientId);
  }
};

const handleMessage = (wsConn, type, data) => {
  switch (type) {
    case 'heartbeat':
      onHeartbeat(wsConn, data);
      break;
    case 'client-id':
      onMessageClientId(wsConn, data);
      break;
    case 'share-confirm':
      onShareConfirm(wsConn, data);
      break;
    default:
      break;
  }
};

const onHeartbeat = (wsConn) => {
  setTimeout(() => {
    sendHeartbeat(wsConn, 'Are you alive?');
  }, 5000);
};

const sendHeartbeat = (wsConn, message) => {
  if (wsConn.readyState === WebSocket.OPEN) {
    sendWS(wsConn, {
      type: 'heartbeat',
      data: message
    });
  }
};

const onMessageClientId = (wsConn, data) => {
  const { publicKey, cachedClientId, cachedSessionId } = data;

  let clientId;
  let sessionId;

  if (!connMap.has(cachedClientId)) {
    clientId = cachedClientId || generateClientId();
    sessionId = cachedSessionId || generateSessionId();
    connMap.set(clientId, [wsConn]);
  } else {
    const existingWsConns = connMap.get(cachedClientId);
    const existingSessionId = existingWsConns[0].sessionId;

    if (existingSessionId === cachedSessionId) {
      clientId = cachedClientId;
      sessionId = existingSessionId;
      existingWsConns.push(wsConn);
    } else {
      clientId = generateClientId();
      sessionId = generateSessionId();
      connMap.set(clientId, [wsConn]);
    }
  }

  wsConn.clientId = clientId;
  wsConn.sessionId = sessionId;
  wsConn.publicKey = publicKey;

  sendWS(wsConn, {
    type: 'client-id',
    data: {
      clientId,
      sessionId
    }
  });
};

const onShareConfirm = (wsConn, data) => {
  if (sharingConfirmationMap.has(data)) {
    sharingConfirmationMap.get(data)();
    sharingConfirmationMap.delete(data);
  }
};

const generateSessionId = () => uuid();

const generateClientId = () => {
  let nextClientId;

  do {
    nextClientId = genNextClientId(4);
  } while (connMap.has(nextClientId));

  return nextClientId;
};

const genNextClientId = (length) => {
  const ln = charSet.length;
  let key = '';

  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * (ln - 1));
    key += charSet.substring(idx, idx + 1);
  }

  return key;
};

module.exports = {
  handleWSConn
};
