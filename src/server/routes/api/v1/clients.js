const express = require('express');
const HttpStatus = require('http-status-codes');
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
  sendWS(
    toWSConn,
    {
      type: 'share',
      data: {
        from: clientId,
        encKey,
        data
      }
    },
    (err) => {
      if (err) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({
            message: String(err)
          });
        return;
      }

      res.status(HttpStatus.OK)
        .json({
          message: 'shared'
        });
    }
  );
}));

module.exports = router;
