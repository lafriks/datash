const express = require('express');
const HttpStatus = require('http-status-codes');
const { wrapAsyncMiddleware } = require('../../../helper');

const router = express.Router();

router.get('/', wrapAsyncMiddleware(async (req, res) => {
  res.status(HttpStatus.OK)
    .json({
      x: process.env.X
    });
}));

module.exports = router;
