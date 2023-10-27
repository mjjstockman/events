const mongoose = require('mongoose');
const { model } = require('mongoose');

const eventSchema = mongoose.Schema({
  name: String,
  location: String,
  details: String,
  date: Date,
  price: Number,
  imageUrl: String,
});

module.exports.Event = model('Event', eventSchema);
