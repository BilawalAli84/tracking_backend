const express = require('express');
const router = express.Router();
const Tracker = require('../models/tracker');
const User = require('../models/user');
const Tag = require('../models/tags');
const Events = require('../models/events_info');
const axios = require('axios'); // Import Axios for making HTTP requests
const crypto = require('crypto');
const Tracking = require('../models/tracking');
const jwt = require('jsonwebtoken');

function generateSessionId(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

exports.add_lead_by_api = async (req, res, next) => {
  if (req.headers['authorization']) {
      try {
          let authorization = req.headers['authorization'].split(' ');
          if (authorization[0] !== 'Bearer') {
              return res.status(401).send('Invalid request'); // Invalid request
          } else {
              // Extract the token from the authorization header
              const token = authorization[1];

              // Retrieve the user from the database using the decoded user ID
              const userData = await User.findOne({ api_key: token });

              if (!userData) {
                  return res.status(401).json({ success: true, message: 'Invalid API key' }); // Invalid API key
              }
              const session_id = generateSessionId(16); 

              const newTracker = new Tracker({
                script_key: userData._id,
                user_id: userData._id,
                utm_source: req.body.utm_source,
                utm_medium: req.body.utm_medium,
                utm_campaign: req.body.utm_campaign,
                utm_content: req.body.utm_content,
                utm_term: req.body.utm_term,
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email_input: req.body.email_input,
                data1: req.body.data1,
                data5: req.body.data5,
                session_id: session_id
              });
              await newTracker.save();

              if (req.body.tag) {
                const newTag = new Tag({
                  script_key: userData._id,
                  user_id: userData._id,
                  utm_source: req.body.utm_source,
                  utm_medium: req.body.utm_medium,
                  utm_campaign: req.body.utm_campaign,
                  utm_content: req.body.utm_content,
                  first_name: req.body.first_name,
                  last_name: req.body.last_name,
                  email_input: req.body.email_input,
                  data1: req.body.data1,
                  data5: req.body.data5,
                  fbp: req.body.fbp,
                  fbc: req.body.fbc,
                  tag: req.body.tag,
                  session_id: session_id
                });
                await newTag.save();
            }

              return res.status(200).json({ success: true, message: 'Lead added successfully' });
          }
      } catch (err) {
          console.error('Error processing API request:', err);
          return res.status(500).send('Internal Server Error');
      }
  } else {
      return res.status(401).send('Invalid request');
  }
};

exports.update_lead_by_api = async (req, res, next) => {
  if (req.headers['authorization']) {
    try {
      let authorization = req.headers['authorization'].split(' ');
      if (authorization[0] !== 'Bearer') {
        return res.status(401).send('Invalid request'); // Invalid request
      } else {
        // Extract the token from the authorization header
        const token = authorization[1];

        // Retrieve the user from the database using the decoded user ID
        const userData = await User.findOne({ api_key: token });

        if (!userData) {
          return res.status(401).json({ success: false, message: 'Invalid API key' }); // Invalid API key
        }
        const email = req.query.email;
        // Find and update the existing lead based on user_id and session_id
        const existingLead = await Tracker.findOne({
          user_id: userData._id,
          email_input: email,
        });

        if (!existingLead) {
          return res.status(404).json({ success: false, message: 'Lead not found' });
        }

        // Update fields if they are provided in the request body and not blank
        if (req.body.utm_source) existingLead.utm_source = req.body.utm_source;
        if (req.body.utm_medium) existingLead.utm_medium = req.body.utm_medium;
        if (req.body.utm_campaign) existingLead.utm_campaign = req.body.utm_campaign;
        if (req.body.utm_content) existingLead.utm_content = req.body.utm_content;
        if (req.body.utm_term) existingLead.utm_term = req.body.utm_term;
        if (req.body.first_name) existingLead.first_name = req.body.first_name;
        if (req.body.last_name) existingLead.last_name = req.body.last_name;
        if (req.body.email_input) existingLead.email_input = req.body.email_input;
        if (req.body.data1) existingLead.data1 = req.body.data1;
        if (req.body.data5) existingLead.data5 = req.body.data5;

        // Save the updated lead
        await existingLead.save();

        // If tag is provided, update the tag as well
        if (req.body.tag) {
          const existingTag = await Tag.findOne({
            user_id: userData._id,
            email_input: email,
          });

          if (existingTag) {
            // Update tag fields if they are provided in the request body and not blank
            if (req.body.utm_source) existingTag.utm_source = req.body.utm_source;
            if (req.body.utm_medium) existingTag.utm_medium = req.body.utm_medium;
            if (req.body.utm_campaign) existingTag.utm_campaign = req.body.utm_campaign;
            if (req.body.utm_content) existingTag.utm_content = req.body.utm_content;
            if (req.body.utm_term) existingTag.utm_term = req.body.utm_term;
            if (req.body.first_name) existingTag.first_name = req.body.first_name;
            if (req.body.last_name) existingTag.last_name = req.body.last_name;
            if (req.body.email_input) existingTag.email_input = req.body.email_input;
            if (req.body.data1) existingTag.data1 = req.body.data1;
            if (req.body.data5) existingTag.data5 = req.body.data5;
            if (req.body.tag) existingTag.tag = req.body.tag;

            // Save the updated tag
            await existingTag.save();
          }
        }

        return res.status(200).json({ success: true, message: 'Lead updated successfully' });
      }
    } catch (err) {
      console.error('Error processing update lead request:', err);
      return res.status(500).send('Internal Server Error');
    }
  } else {
    return res.status(401).send('Invalid request');
  }
};