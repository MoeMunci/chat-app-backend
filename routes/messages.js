const express = require('express');
const router = express.Router();

// Message model
const Message = require('../models/message');

// Get all messages
router.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find();
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Add a new message
router.post('/messages', async (req, res) => {
  const { user, content } = req.body;
  const newMessage = new Message({ user, content });
  try {
    const savedMessage = await newMessage.save();
    res.json(savedMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
