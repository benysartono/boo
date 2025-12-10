// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Create a user
// POST /boo/users
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Missing name' });
    }

    const user = await User.create({ name });

    res.status(201).json({
      success: true,
      id: user._id,
      user
    });
  } catch (err) {
    console.error('POST /users error', err);
    res.status(500).json({ success: false, error: 'Failed to create user' });
  }
});

// List all users
// GET /boo/users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().sort({ name: 1 });

    res.json({
      success: true,
      users
    });
  } catch (err) {
    console.error('GET /users error', err);
    res.status(500).json({ success: false, error: 'Failed to list users' });
  }
});

module.exports = router;
