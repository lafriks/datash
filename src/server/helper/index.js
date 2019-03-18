const axios = require('axios');

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

const fetchAddressFromIP = async (ip) => {
  const { data } = await axios.get(`https://ipapi.co/${encodeURIComponent(ip)}/json/`);
  return data;
};

module.exports = {
  wrapAsyncMiddleware,
  sendWS,
  fetchAddressFromIP
};
