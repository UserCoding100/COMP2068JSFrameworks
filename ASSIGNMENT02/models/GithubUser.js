const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// GitHub User Schema
const GithubUserSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  githubId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    default: null,
  },
  avatarUrl: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Export Model
module.exports = mongoose.model('GithubUser', GithubUserSchema);
