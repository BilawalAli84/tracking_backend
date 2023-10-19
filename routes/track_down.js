const express = require('express');
const router = express.Router();
const Tracker = require('../models/tracker');

// Tracked Data To MongoDB
router.post('/', async (req, res) => {
  try {
    const {
      session_id,
      current_url,
      reference_url,
      fbp,
      fbc,
      url_parameters: {
        utm_source,
        utm_medium,
        utm_campaign,
        utm_content,
        utm_term,
      },
      input_values: {
        'contact[first_name]': first_name,
        'contact[last_name]': last_name,
        'contact[email]': email_input,
        'userevents[funnel_step_id]' : data1,
        'purchase[product_id]' : data5
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
      first_name,
      last_name,
      email_input,
      data1,
      data5,
      fbp,
      fbc,
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
router.get('/all', async (req, res) => {
  try {
    const allTrackerData = await Tracker.find();
    res.status(200).json(allTrackerData);
  } catch (error) {
    console.error('Error retrieving tracker data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.get('/unique_optins', async (req, res) => {
  try {
    const allTrackerData = await Tracker.find();

    // Extract unique session IDs and create a set of unique session IDs
    const uniqueSessionIDs = new Set(allTrackerData.map(data => data.session_id));

    // Create an array to store the unique rows
    const uniqueRows = [];

    // Iterate through the data and filter unique session IDs
    for (const session_id of uniqueSessionIDs) {
      const uniqueRow = allTrackerData.find(data => data.session_id === session_id);
      uniqueRows.push(uniqueRow);
    }

    // Send both the unique rows and the count as a JSON response
    res.status(200).json({ count: uniqueSessionIDs.size, uniqueRows });
  } catch (error) {
    console.error('Error retrieving tracker data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
module.exports = router;
