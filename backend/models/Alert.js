const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  level: { type: String, enum: ['normal', 'watch', 'warning'], required: true },
  message: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);