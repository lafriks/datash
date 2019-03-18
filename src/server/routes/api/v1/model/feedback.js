const mongoose = require('mongoose');

const UserAddressSchema = new mongoose.Schema({
  ip: String,
  city: String,
  region: String,
  country: String,
  postal: String,
  latitude: String,
  longitude: String,
  timezone: String,
});

const FeedbackSchema = new mongoose.Schema({
  rating: Number,
  ratingLabel: String,
  suggestions: String,
  userAgent: String,
  clientId: String,
  address: UserAddressSchema,
  date: Date
});

const Feedback = mongoose.model('Feedback', FeedbackSchema);

module.exports = Feedback;
