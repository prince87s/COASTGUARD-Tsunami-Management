const requireAuth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');

const defaultMessages = {
  normal: 'Alert level set to Normal. Sensors nominal.',
  watch: 'Alert level raised to WATCH. Shelters notified to prepare.',
  warning: 'Alert level raised to WARNING. Evacuation orders issued.',
};

// GET recent alerts
router.get('/', async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 }).limit(20);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new alert — broadcasts instantly to every connected client
router.post('/', requireAuth, async (req, res) => {
  try {
    const { level, message } = req.body;
    if (!['normal', 'watch', 'warning'].includes(level)) {
      return res.status(400).json({ error: 'level must be normal, watch, or warning' });
    }
    const alert = new Alert({
      level,
      message: message || defaultMessages[level],
    });
    const saved = await alert.save();

    const io = req.app.get('io');
    io.emit('newAlert', saved);

    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;