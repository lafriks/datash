const express = require('express');
const HttpStatus = require('http-status-codes');
const { wrapAsyncMiddleware, fetchAddressFromIP } = require('../../../helper');
const Feedback = require('./model/feedback');

const router = express.Router();

router.post('/', wrapAsyncMiddleware(async (req, res) => {
  const {
    rating, ratingLabel, suggestions, userAgent, clientId
  } = req.body;

  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const address = await fetchAddressFromIP(clientIP);

  const feedback = new Feedback({
    rating: rating || 3,
    ratingLabel: ratingLabel || 'Normal',
    suggestions: suggestions || null,
    userAgent: userAgent || null,
    clientId: clientId || null,
    address: {
      ip: address.ip || clientIP,
      city: address.city || null,
      region: address.region || null,
      country: address.country_name || null,
      postal: address.postal || null,
      latitude: address.latitude || null,
      longitude: address.longitude || null,
      timezone: address.timezone || null,
    },
    date: new Date()
  });

  await feedback.save();

  res.status(HttpStatus.CREATED)
    .json({
      message: HttpStatus.getStatusText(HttpStatus.CREATED)
    });
}));

module.exports = router;
