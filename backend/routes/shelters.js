function calculateStatus(occupied, capacity, requestedStatus) {
  // Manual "closed" is the only status an admin can force — everything else is calculated
  if (requestedStatus === 'closed') return 'closed';
  const ratio = capacity > 0 ? occupied / capacity : 0;
  if (ratio >= 1) return 'full';
  if (ratio >= 0.75) return 'limited';
  return 'open';
}
const requireAuth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const Shelter = require('../models/Shelter');

// GET all shelters
router.get('/', async (req, res) => {
  try {
    const shelters = await Shelter.find().sort({ createdAt: -1 });
    res.json(shelters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single shelter by ID
router.get('/:id', async (req, res) => {
  try {
    const shelter = await Shelter.findById(req.params.id);
    if (!shelter) return res.status(404).json({ error: 'Shelter not found' });
    res.json(shelter);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a new shelter
router.post('/', requireAuth, async (req, res) => {
  try {
    const status = calculateStatus(req.body.occupied || 0, req.body.capacity, req.body.status);
    const shelter = new Shelter({ ...req.body, status });
    const saved = await shelter.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE a shelter (e.g., change occupancy or status)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const existing = await Shelter.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Shelter not found' });

    const occupied = req.body.occupied ?? existing.occupied;
    const capacity = req.body.capacity ?? existing.capacity;
    const status = calculateStatus(occupied, capacity, req.body.status);

    const updated = await Shelter.findByIdAndUpdate(
      req.params.id,
      { ...req.body, status },
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a shelter
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const deleted = await Shelter.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Shelter not found' });
    res.json({ message: 'Shelter deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;