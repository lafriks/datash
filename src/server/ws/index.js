const WebSocket = require('ws');
const uuid = require('uuid/v4');
const logger = require('../logger');
const { sendWS, extractClientIp } = require('../helper');

const charSet = '0123456789';
const connMap = global.connMap = new Map();
const sharingConfirmationMap = global.sharingConfirmationMap = new Map();

const handleWSConn = (wsConn, req) => {
  logger.info(`WS ${extractClientIp(req)}`);

  wsConn.req = req;

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
      onMessageHeartbeat(wsConn, data);
      break;
    case 'register':
      onMessageRegister(wsConn, data);
      break;
    case 'share-confirm':
      onMessageShareConfirm(wsConn, data);
      break;
    case 'progress':
      onMessageProgress(wsConn, data);
      break;
    case 'webrtc-offer':
      onMessageWebRTCOffer(wsConn, data);
      break;
    case 'webrtc-answer':
      onMessageWebRTCAnswer(wsConn, data);
      break;
    case 'webrtc-candidate':
      onMessageWebRTCCandidate(wsConn, data);
      break;
    default:
      break;
  }
};

const onMessageHeartbeat = (wsConn) => {
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

const onMessageRegister = (wsConn, data) => {
  const {
    publicKey, cachedClientId, cachedSessionId, isWebRTCSupported
  } = data;

  let clientId;
  let sessionId;

  if (!connMap.has(cachedClientId)) {
    clientId = validateClientId(cachedClientId) || generateClientId();
    sessionId = validateSessionId(cachedSessionId) || generateSessionId();
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
  wsConn.isWebRTCSupported = isWebRTCSupported;

  sendWS(wsConn, {
    type: 'register',
    data: {
      clientId,
      sessionId
    }
  });
};

const onMessageShareConfirm = (wsConn, data) => {
  if (sharingConfirmationMap.has(data)) {
    sharingConfirmationMap.get(data)();
    sharingConfirmationMap.delete(data);
  }
};

const onMessageProgress = (wsConn, data) => {
  const {
    progressId, to, message, error
  } = data;

  if (!connMap.has(to)) {
    return;
  }

  const toWsConns = connMap.get(to);
  toWsConns.forEach((toWsConn) => {
    sendWS(toWsConn, {
      type: 'progress',
      data: {
        progressId,
        from: wsConn.clientId,
        message,
        error
      }
    });
  });
};

const onMessageWebRTCOffer = (wsConn, data) => {
  const { to, offer } = data;

  if (!connMap.has(to)) {
    sendWS(wsConn, {
      type: 'webrtc-client-not-found',
      data: { clientId: to },
    });
    return;
  }

  const wsConnTo = connMap.get(to)[0];

  sendWS(wsConnTo, {
    type: 'webrtc-offer',
    data: { from: wsConn.clientId, offer },
  });
};

const onMessageWebRTCAnswer = (wsConn, data) => {
  const { to, answer } = data;

  if (!connMap.has(to)) {
    sendWS(wsConn, {
      type: 'webrtc-client-not-found',
      data: { clientId: to },
    });
    return;
  }

  const wsConnTo = connMap.get(to)[0];

  sendWS(wsConnTo, {
    type: 'webrtc-answer',
    data: { from: wsConn.clientId, answer },
  });
};

const onMessageWebRTCCandidate = (wsConn, data) => {
  const { to, candidate } = data;

  if (!connMap.has(to)) {
    sendWS(wsConn, {
      type: 'webrtc-client-not-found',
      data: { clientId: to },
    });
    return;
  }

  const wsConnTo = connMap.get(to)[0];

  sendWS(wsConnTo, {
    type: 'webrtc-candidate',
    data: { from: wsConn.clientId, candidate },
  });
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

const validateClientId = (clientId) => {
  if (!clientId) {
    return null;
  }

  if (clientId.match(/^\d{4}$/)) {
    return clientId;
  }

  return null;
};

const validateSessionId = (sessionId) => {
  if (!sessionId) {
    return null;
  }

  if (sessionId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
    return sessionId;
  }

  return null;
};

module.exports = {
  handleWSConn
};
