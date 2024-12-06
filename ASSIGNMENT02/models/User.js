const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// User Schema
const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  githubId: {
    type: String,
    default: null,
  },
});

// Export Model
module.exports = mongoose.model('User', UserSchema);
