const express = require('express');
const HttpStatus = require('http-status-codes');
const axios = require('axios');
const { wrapAsyncMiddleware, fetchAddressFromIP, extractClientIp } = require('../../../helper');
const Feedback = require('./model/feedback');

const router = express.Router();

router.post('/', wrapAsyncMiddleware(async (req, res) => {
  const {
    rating, ratingLabel, suggestions, userAgent, clientId
  } = req.body;

  const clientIP = extractClientIp(req);
  const address = await fetchAddressFromIP(clientIP);

  const feedbackData = {
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
  };

  const feedback = new Feedback(feedbackData);
  await feedback.save();

  await sendFeedbackMail(feedbackData);

  res.status(HttpStatus.CREATED)
    .json({
      message: HttpStatus.getStatusText(HttpStatus.CREATED)
    });
}));

const sendFeedbackMail = async (feedback) => {
  const mailConfig = {
    personalizations: [
      {
        to: [
          {
            email: 'hello@rousan.io'
          },
        ],
        dynamic_template_data: feedback,
      },
    ],
    from: {
      email: 'datash@datash.co',
      name: 'Datash',
    },
    template_id: 'd-abd35045554c45f983a4b0438f4a1735',
  };

  const headers = {
    'content-type': 'application/json',
    authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
  };

  await axios.post('https://api.sendgrid.com/v3/mail/send', mailConfig, { headers });
};

module.exports = router;
