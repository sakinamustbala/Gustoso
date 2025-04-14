const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const auth = require('../middleware/auth');

// Submit contact form
router.post('/', async (req, res) => {
  try {
    console.log('Received contact form submission:', req.body);
    
    const { name, email, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !message) {
      console.log('Missing required fields:', { name, email, message });
      return res.status(400).json({ 
        success: false, 
        error: 'All fields are required' 
      });
    }
    
    const contact = new Contact({
      name,
      email,
      message
    });

    console.log('Saving contact message:', contact);
    await contact.save();
    console.log('Contact message saved successfully');
    
    res.status(201).json({ 
      success: true, 
      data: contact,
      message: 'Message sent successfully' 
    });
  } catch (error) {
    console.error('Error saving contact form:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Server error' 
    });
  }
});

// Get all contact messages (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router; 