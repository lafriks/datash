const WebSocket = require('ws');
const logger = require('../logger');
const { sendWS } = require('../helper');

const charSet = '0123456789';
const connMap = global.connMap = new Map();

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

    if (connMap.has(wsConn.clientId)) {
      connMap.delete(wsConn.clientId);
    }
  });

  wsConn.on('error', (err) => {
    logger.error(err);
    wsConn.terminate();

    if (connMap.has(wsConn.clientId)) {
      connMap.delete(wsConn.clientId);
    }
  });

  sendHeartbeat(wsConn, 'Are you alive?');
};

const handleMessage = (wsConn, type, data) => {
  switch (type) {
    case 'heartbeat':
      onHeartbeat(wsConn);
      break;
    case 'client-id':
      onMessageClientId(wsConn, data);
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
  const clientId = generateClientId();
  connMap.set(clientId, wsConn);

  wsConn.clientId = clientId;
  wsConn.publicKey = data;
};

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
