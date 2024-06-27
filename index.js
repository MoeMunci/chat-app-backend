const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Sample route
app.get('/', (req, res) => {
  res.send('Chat Application Backend');
});
// Import necessary modules
const User = require('./models/User'); // Assuming you have a User model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Middleware for authentication
const auth = require('./middleware/auth');

// User Authentication Endpoints

// Sign Up
app.post('/api/users/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send('User already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 8);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).send('User created successfully');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Login
app.post('/api/users/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send('Authentication failed');
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Message Handling Endpoints

// Post Message
app.post('/api/messages', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const message = new Message({ user: req.user.id, content });
    await message.save();
    res.status(201).send('Message posted successfully');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Get Messages
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().populate('user', 'username');
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).send(error.message);
  }
});
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const router = express.Router();
const Message = require('./message'); // assuming the Message model is in the models directory

// Import the messagesRouter
const messagesRouter = require('./message');

// Use the messagesRouter for routes starting with '/api'
app.use('/api', messagesRouter);

// Add a new message
router.post('/message', async (req, res) => {
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
