const express = require('express');
const router = express.Router();
const HelpRequest = require('../models/HelpRequest');
const requireAuth = require('../middleware/auth');

// GET pending help requests — public, so anyone can see active situations
router.get('/', async (req, res) => {
  try {
    const requests = await HelpRequest.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new help request — public, anyone in distress can submit
router.post('/', async (req, res) => {
  try {
    const { name, message, latitude, longitude } = req.body;
    if (!message || latitude == null || longitude == null) {
      return res.status(400).json({ error: 'message, latitude, and longitude are required' });
    }
    const request = new HelpRequest({ name: name || 'Anonymous', message, latitude, longitude });
    const saved = await request.save();

    const io = req.app.get('io');
    io.emit('newHelpRequest', saved);

    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Mark resolved — admin only
router.put('/:id/resolve', requireAuth, async (req, res) => {
  try {
    const updated = await HelpRequest.findByIdAndUpdate(req.params.id, { status: 'resolved' }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Request not found' });

    const io = req.app.get('io');
    io.emit('resolvedHelpRequest', updated);

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;