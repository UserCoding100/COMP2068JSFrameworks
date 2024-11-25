const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    username: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: String, required: true },
    channel: { type: String, required: true, default: 'General' },
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
