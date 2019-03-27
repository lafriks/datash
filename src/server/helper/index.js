const axios = require('axios');
const ws = require('ws');
const logger = require('../logger');

const wrapAsyncMiddleware = asyncFn => async (req, res, next) => {
  try {
    await asyncFn(req, res, next);
  } catch (err) {
    next(err);
  }
};

const sendWS = (wsConn, data, cb) => {
  wsConn.send(JSON.stringify(data), cb);
};

const shakeWholeConnMap = (connMap) => {
  [...connMap.keys()].forEach((clientId) => {
    shakeSingleConnMap(connMap, clientId);
  });
};

const shakeSingleConnMap = (connMap, clientId) => {
  if (!connMap.has(clientId)) {
    return;
  }

  const wsConns = connMap.get(clientId);
  let i = wsConns.length - 1;

  while (i >= 0) {
    const wsConn = wsConns[i];

    if (wsConn.readyState === ws.CLOSED || wsConn.readyState === ws.CLOSING) {
      try {
        wsConn.terminate();
      } catch (err) {
        logger.error(err);
      }
      wsConns.splice(i, 1);
    }

    i--;
  }

  if (!wsConns.length) {
    connMap.delete(clientId);
  }
};

const fetchAddressFromIP = async (ip) => {
  const { data } = await axios.get(`https://ipapi.co/${encodeURIComponent(ip)}/json/`);
  return data;
};

const extractClientIp = (req) => {
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  return clientIP.split(',')[0].trim();
};

module.exports = {
  wrapAsyncMiddleware,
  sendWS,
  fetchAddressFromIP,
  shakeSingleConnMap,
  shakeWholeConnMap,
  extractClientIp
};
