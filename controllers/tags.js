const User = require('../models/user');
const UrlRules = require('../models/url_rules');
const Tag = require('../models/tags');
const jwt = require('jsonwebtoken');

exports.get_tags = async (req, res, next) => {
    if (req.headers['authorization']) {
      try {
        let authorization = req.headers['authorization'].split(' ');
        if (authorization[0] !== 'Bearer') {
          return res.status(401).send('Invalid request'); // Invalid request
        } else {
          req.jwt = jwt.verify(authorization[1], process.env.TOKEN_SECRET);
          const userData = req.jwt;
  
          // Retrieve all domains for the user_id
          const userUrls = await UrlRules.find({ user_id: userData.userId });
  
          // Extract domain values from the userDomains array
          const tags = userUrls.map((userUrls) => userUrls.tag);
  
          return res.status(200).json({ success: true, tags });
        }
      } catch (err) {
        console.error('Error verifying token:', err);
        return res.status(403).send(err);
      }
    } else {
      return res.status(401).send('Invalid request');
    }
};

exports.get_tag_data = async (req, res, next) => {
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
      const uniqueSessionIds = await Tag.distinct('session_id', { user_id: userData.userId });
      console.log(uniqueSessionIds);
      // Use the unique session_ids to query the database for the latest data
      const uniqueRows = await Promise.all(
        uniqueSessionIds.map(async (sessionId) => {
          const latestRows = await Tag.find({ user_id: userData.userId, session_id: sessionId, tag: req.query.tagName})
            .sort({ tracked_date: -1 }) // Sort by tracked_date in descending order to get the latest data
            .limit(1) // Limit to 1 row per session_id
            .exec();
            console.log(req.query);
            console.log(latestRows);
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