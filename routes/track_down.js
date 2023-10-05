const express = require('express');
const router = express.Router();
const Tracker = require('../models/tracker');

// Tracked Data To MongoDB
router.post('/', async (req, res) => {
  try {
    // Extract the desired fields from the request body
    const {
      session_id,
      current_url,
      reference_url,
      url_parameters: {
        utm_source,
        utm_medium,
        utm_campaign,
        utm_content,
        utm_term,
      },
    } = req.body;

    // Create a new Tracker document with the extracted fields
    const newTracker = new Tracker({
      session_id,
      current_url,
      reference_url,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
    });

    // Save the document to the database
    await newTracker.save();

    // Respond with a success message
    res.status(201).json({
      message: 'Data saved to MongoDB',
    });
  } catch (error) {
    console.error('Error saving data to MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
