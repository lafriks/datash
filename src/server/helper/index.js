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

module.exports = {
  wrapAsyncMiddleware,
  sendWS
};
