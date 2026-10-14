const mongoose = require('mongoose');

const helpRequestSchema = new mongoose.Schema({
  name: { type: String, default: 'Anonymous' },
  message: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('HelpRequest', helpRequestSchema);