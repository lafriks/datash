const express = require('express');
const HttpStatus = require('http-status-codes');
const { wrapAsyncMiddleware } = require('../../../helper');

const router = express.Router();

router.get('/generate', wrapAsyncMiddleware(async (req, res) => {
  res.status(HttpStatus.OK)
    .json({
      id: Math.random() * 100
    });
}));

module.exports = router;
