const express = require('express');
const router = express.Router();
const Tracker = require('../models/tracker');
const Tag = require('../models/tags');
const Events = require('../models/events_info');
const axios = require('axios'); // Import Axios for making HTTP requests
const crypto = require('crypto');
const Tracking = require('../models/tracking');
const jwt = require('jsonwebtoken');



function stripParameters(url) {
    // Implement logic to strip parameters from the URL
    // For example, you can use the URL API to achieve this
    const parsedUrl = new URL(url);
    return `${parsedUrl.origin}${parsedUrl.pathname}`;
  }
  async function fireFacebookConversion(eventName, pixel_id, access_token, data,useragent,test_code) {
    try {
      // Construct the payload for the Facebook Conversion API request
      const payload = {
        data: [
          {
            event_name: eventName, // Replace with your event name
            event_time: Math.floor(Date.now() / 1000), // Unix timestamp in seconds
            user_data: {
            },
            // Include other event-specific parameters as needed
          },
        ],
        "test_event_code": test_code //if parameters are present then it will go otherwise dont send the optioonal parameters
      };
  
      if (data.email !== undefined && data.email !== "") {
        payload.data[0].user_data.em = crypto.createHash('sha256').update(data.email).digest('hex');
      }
  
      if (data.first_name !== undefined && data.first_name !== "") {
        payload.data[0].user_data.fn = crypto.createHash('sha256').update(data.first_name).digest('hex');
      }
  
      if (data.last_name !== undefined && data.last_name !== "") {
        payload.data[0].user_data.ln = crypto.createHash('sha256').update(data.last_name).digest('hex');
      }
  
      if (data.phone !== undefined && data.phone !== "") {
        payload.data[0].user_data.ph = crypto.createHash('sha256').update(data.phone).digest('hex');
      }
  
      if (data.country !== undefined && data.country !== "") {
        payload.data[0].user_data.country = crypto.createHash('sha256').update(data.country).digest('hex');
      }
  
      if (data.ip !== undefined && data.ip !== "") {
        payload.data[0].user_data.client_ip_address = data.ip;
      }
  
      if (useragent !== undefined && useragent !== "") {
        payload.data[0].user_data.client_user_agent = useragent;
      }
  
      if (data.fbp !== undefined && data.fbp !== "") {
        payload.data[0].user_data.fbp = data.fbp;
      }
  
      if (data.fbc !== undefined && data.fbc !== "") {
        payload.data[0].user_data.fbc = data.fbc;
      }
      console.log('Payload to be sent to Facebook Conversion API 111:', payload);
      console.log('Payload to be sent to Facebook Conversion API:', payload.data[0].user_data);
      // Your Facebook Conversion API access token
      const accessToken = access_token;
  
      // Your Facebook Pixel ID
      const pixelId = pixel_id;
  
      // Construct the API URL
      const apiUrl = `https://graph.facebook.com/v13.0/${pixelId}/events?access_token=${accessToken}`;
  
      // Send the event data to the Facebook Conversion API
      const response = await axios.post(apiUrl, payload);
  
      if (response.status === 200) {
        console.log('Facebook Conversion event sent successfully',response.data);
      } else {
        console.error('Error sending Facebook Conversion event:', response.message);
      }
    } catch (error) {
      console.error('Error sending Facebook Conversion event:', error.message);
    }
  }

  async function saveTagData(data,tag) {
    const newTagData = new Tag({
        script_key: data.script_key, // Use data.script_key for script_key
        user_id: data.script_key,
        session_id: data.session_id,
        current_url: data.current_url,
        reference_url: data.reference_url,
        utm_source: data.url_parameters.utm_source,
        utm_medium: data.url_parameters.utm_medium,
        utm_campaign: data.url_parameters.utm_campaign,
        utm_content: data.url_parameters.utm_content,
        utm_term: data.url_parameters.utm_term,
        first_name: data.first_name,
        last_name: data.last_name,
        email_input: data.email_input,
        data1: data.data1,
        data5: data.data5,
        fbp: data.fbp,
        fbc: data.fbc,
        tag: tag,
      });

      // Save the document to the database
      await newTagData.save();
  }
  
  // Tracked Data To MongoDB
  exports.tracked_data = async (req, res, next) => {
    try {
      const {
        session_id,
        current_url,
        reference_url,
        track_type,
        script_key,
        fbp,
        fbc,
        email_input,
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
          'userevents[funnel_step_id]': data1,
          'purchase[product_id]': data5,
        },
      } = req.body;
      const user_agent = req.headers['user-agent'];
      // console.log(user_agent);
      
      // Check if there is a document in the database with the provided script_key
      const existingTrackers = await Tracking.find({ user_id: script_key });
  
      if (existingTrackers.length > 0) {
        // Check if any of the domains match the current_url
        const strippedCurrentUrl = current_url.split('?')[0];
        const { protocol, hostname, pathname } = new URL(current_url);
        const strippedDomain = `${protocol}//${hostname}`;
        const strippedPath = pathname;
  
        const matchingTracker = existingTrackers.find(existingTracker => existingTracker.domain === strippedDomain);
  
        if (matchingTracker) {
          const user_id = matchingTracker.user_id;
          const newTracker = new Tracker({
            script_key,
            user_id,
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
          // console.log(newTracker);
  
          if (track_type === 'onload') {
            // Call the function to fire the Facebook conversion event
            findAndFireEvent(req.body, strippedPath, user_agent,strippedDomain);
          }
  
          // Respond with a success message
          res.status(201).json({
            message: 'Data saved to MongoDB',
          });
        } else {
          // None of the domains match, return an error
          res.status(403).json({
            error: 'Not Allowed: WebUrl mismatch',
          });
        }
      } else {
        // No matching documents found, handle accordingly
        res.status(404).json({
          error: 'No matching documents found',
        });
      }
    } catch (error) {
      // console.error('Error saving data to MongoDB:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
}
  
  async function findAndFireEvent(data,strippedPath,user_agent,strippedDomain) {
    try {
      const uniqueId = data.script_key;
      const currentUrl = data.current_url;
      const baseUrlWithoutParams = currentUrl.split('?')[0];
  
      // Replace 'events_info' with your actual Mongoose model for the "events_info" collection
      const eventInfo = await Tracking.findOne({ user_id: uniqueId, webUrl: strippedPath, domain: strippedDomain});
      // console.log(eventInfo);
      if (eventInfo) {
        // Found a matching document
        const eventName = eventInfo.event;
        const pixel_id = eventInfo.pixelId;
        const access_token = eventInfo.access_token;
        const test_code = eventInfo.test_code;
        // console.log('Found a matching document with event_name:', eventName);
  
        // Fire the Facebook Conversion event
        await fireFacebookConversion(eventName, pixel_id, access_token, data,user_agent,test_code);
        await saveTagData(data,eventInfo.tag);
      } else {
        console.log('No matching document found in events_info.');
      }
    } catch (error) {
      console.error('Error finding and firing event:', error);
    }
  }
  
  exports.all = async (req, res, next) => {
    try {
      const allTrackerData = await Tracker.find();
      res.status(200).json(allTrackerData);
    } catch (error) {
      console.error('Error retrieving tracker data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  exports.unique_optins = async (req, res, next) => {
    try {
      let userData;
      if (req.headers['authorization']) {
        const authorization = req.headers['authorization'].split(' ');
        if (authorization[0] === 'Bearer') {
          req.jwt = jwt.verify(authorization[1], process.env.TOKEN_SECRET);
          userData = req.jwt;
          console.log(userData);
        }
      }
  
      if (!userData) {
        return res.status(401).send('Invalid or missing authorization token');
      }
  
      const { page = 1, perPage = 10 } = req.query;
      const skip = (page - 1) * perPage;
      console.log(perPage);
  
      // Get unique session_ids
      const uniqueSessionIds = await Tracker.distinct('session_id', { user_id: userData.userId });
  
      // Use the unique session_ids to query the database for the latest data
      const uniqueRows = await Promise.all(
        uniqueSessionIds.map(async (sessionId) => {
          const latestRows = await Tracker.find({ user_id: userData.userId, session_id: sessionId })
            .sort({ tracked_date: -1 }) // Sort by tracked_date in descending order to get the latest data
            .limit(1) // Limit to 1 row per session_id
            .exec();
  
          return latestRows[0]; // Return the first (and only) element of the array
        })
      );
  
      // Limit the response to 10 rows per page
      const startIndex = skip;
      const endIndex = skip + Number(perPage);
      const limitedRows = uniqueRows.slice(startIndex, endIndex);
  
      const totalRows = uniqueRows.length;
  
      res.status(200).json({
        totalRows,
        currentPage: Number(page),
        totalPages: Math.ceil(totalRows / perPage),
        uniqueRows: limitedRows,
      });
    } catch (error) {
      console.error('Error retrieving tracker data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }