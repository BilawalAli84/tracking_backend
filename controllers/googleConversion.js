const User = require('../models/user');
const Conversion = require('../models/googleConversion');
const jwt = require('jsonwebtoken');

exports.add_google_conversions = async (req, res, next) => {
    if (req.headers['authorization']) {
        try {
            let authorization = req.headers['authorization'].split(' ');
            if (authorization[0] !== 'Bearer') {
                return res.status(401).send('Invalid request'); // Invalid request
            } else {
                req.jwt = jwt.verify(authorization[1], process.env.TOKEN_SECRET);
                const userData = req.jwt;

                const conversion = new Conversion({
                    user_id: userData.userId,
                    user_email: userData.email,
                    google_id: req.body.google_id,
                    event_id: req.body.event_id,
                    event_name: req.body.event_name,
                });

                // Save the user to the database
                await conversion.save();

                return res.status(200).json({ success: true, message: 'Credentials Added Successfully!'});
            }
        } catch (err) {
            console.error('Error verifying token:', err);
            return res.status(403).send(err);
        }
    } else {
        return res.status(401).send('Invalid request');
    }
};

exports.get_google_conversion = async (req, res, next) => {
    if (req.headers['authorization']) {
      try {
        let authorization = req.headers['authorization'].split(' ');
        if (authorization[0] !== 'Bearer') {
          return res.status(401).send('Invalid request'); // Invalid request
        } else {
          req.jwt = jwt.verify(authorization[1], process.env.TOKEN_SECRET);
          const userData = req.jwt;
  
          // Retrieve all domains for the user_id
          const userConversions = await Conversion.find({ user_id: userData.userId });
  
          // Extract domain values from the userDomains array
          const google_id = userConversions.map((userConversions) => userConversions.event_id);
  
          return res.status(200).json({ success: true, google_id });
        }
      } catch (err) {
        console.error('Error verifying token:', err);
        return res.status(403).send(err);
      }
    } else {
      return res.status(401).send('Invalid request');
    }
};
