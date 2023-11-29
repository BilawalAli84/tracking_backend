const User = require('../models/user');
const UrlRules = require('../models/url_rules');
const jwt = require('jsonwebtoken');

exports.add_url = async (req, res, next) => {
    if (req.headers['authorization']) {
        try {
            let authorization = req.headers['authorization'].split(' ');
            if (authorization[0] !== 'Bearer') {
                return res.status(401).send('Invalid request'); // Invalid request
            } else {
                req.jwt = jwt.verify(authorization[1], process.env.TOKEN_SECRET);
                const userData = req.jwt;

                const url_rules = new UrlRules({
                    user_id: userData.userId,
                    user_email: userData.email,
                    path: req.body.urlPath,
                    event: req.body.eventToFire
                });

                // Save the user to the database
                await url_rules.save();

                return res.status(200).json({ success: true, message: 'Url Rule Added Successfully!'});
            }
        } catch (err) {
            console.error('Error verifying token:', err);
            return res.status(403).send(err);
        }
    } else {
        return res.status(401).send('Invalid request');
    }
};

exports.get_url = async (req, res, next) => {
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
          const urls = userUrls.map((userUrls) => userUrls.path);
  
          return res.status(200).json({ success: true, urls });
        }
      } catch (err) {
        console.error('Error verifying token:', err);
        return res.status(403).send(err);
      }
    } else {
      return res.status(401).send('Invalid request');
    }
};
