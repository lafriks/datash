const express = require('express');
const HttpStatus = require('http-status-codes');
const uuid = require('uuid/v4');
const { sendWS, wrapAsyncMiddleware } = require('../../../helper');

const router = express.Router();

router.get('/:clientId/publicKey', wrapAsyncMiddleware(async (req, res) => {
  const { connMap } = global;
  const { clientId } = req.params;

  if (!connMap.has(clientId)) {
    res.status(HttpStatus.NOT_FOUND)
      .json({
        message: 'Client not found'
      });
    return;
  }

  res.status(HttpStatus.OK)
    .json({
      publicKey: connMap.get(clientId).publicKey
    });
}));

router.post('/:clientId/share', wrapAsyncMiddleware(async (req, res) => {
  const { connMap } = global;
  const { clientId } = req.params;
  const { to: toClientId, encKey, data } = req.body;

  if (!connMap.has(clientId)) {
    res.status(HttpStatus.NOT_FOUND)
      .json({
        message: 'Sender client not found'
      });
    return;
  }

  if (!connMap.has(toClientId)) {
    res.status(HttpStatus.NOT_FOUND)
      .json({
        message: 'Recipient client not found'
      });
    return;
  }

  const toWSConn = connMap.get(toClientId);
  try {
    await shareDataViaWS(toWSConn, clientId, encKey, data);
    res.status(HttpStatus.OK)
      .json({
        message: 'shared'
      });
  } catch (err) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({
        message: String(err)
      });
  }
}));

const shareDataViaWS = (toWSConn, from, encKey, data) => new Promise((res, rej) => {
  sendWS(
    toWSConn,
    {
      type: 'share',
      data: {
        from,
        encKey,
        data,
      }
    },
    (err) => {
      if (err) {
        rej(err);
        return;
      }

      res();
    }
  );
});

module.exports = router;
