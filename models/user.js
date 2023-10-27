const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: String,
  email: String,
  password: String,
  token: String,
});

module.exports.User = mongoose.model('User', userSchema);
