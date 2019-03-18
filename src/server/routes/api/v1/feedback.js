const express = require('express');
const HttpStatus = require('http-status-codes');
const { wrapAsyncMiddleware } = require('../../../helper');

const router = express.Router();

router.post('/', wrapAsyncMiddleware(async (req, res) => {
  res.status(HttpStatus.OK)
    .json({});
}));

module.exports = router;
