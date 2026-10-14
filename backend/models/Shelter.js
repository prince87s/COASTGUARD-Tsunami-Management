const mongoose = require('mongoose');

const shelterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  zone: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  capacity: { type: Number, required: true },
  occupied: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['open', 'limited', 'full', 'closed'],
    default: 'open',
  },
}, { timestamps: true });

module.exports = mongoose.model('Shelter', shelterSchema);