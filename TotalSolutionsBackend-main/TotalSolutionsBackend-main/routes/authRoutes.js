const express = require('express');
const jwt = require('jsonwebtoken');
const Child = require('../models/Child');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/login/child', async (req, res) => {
  const { childId } = req.body;
  if (!childId) return res.status(400).json({ message: 'childId is required' });

  try {
    const child = await Child.findById(childId);
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }

    if (child.admitStatus && child.admitStatus !== 'active') {
      return res.status(403).json({ message: 'Child is not active' });
    }

    const token = jwt.sign(
      {
        sub: child._id,
        name: child.name,
        role: 'child',
      },
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' },
    );

    return res.json({ token, child: { _id: child._id, name: child.name } });
  } catch (err) {
    console.error('POST /api/auth/login/child error:', err.message);
    return res.status(500).json({ message: err.message });
  }
});

router.get('/verify', auth, (req, res) => {
  res.json({ message: 'verified', user: req.user });
});

module.exports = router;
