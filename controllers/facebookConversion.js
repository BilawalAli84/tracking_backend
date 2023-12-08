const User = require('../models/user');
const Conversion = require('../models/conversion');
const jwt = require('jsonwebtoken');

exports.add_conversions = async (req, res, next) => {
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
                    pixel_id: req.body.pixel_id,
                    access_token: req.body.access_token,
                    test_code: req.body.test_code
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

exports.get_conversion = async (req, res, next) => {
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
          const pixels = userConversions.map((userConversions) => userConversions.pixel_id);
  
          return res.status(200).json({ success: true, pixels });
        }
      } catch (err) {
        console.error('Error verifying token:', err);
        return res.status(403).send(err);
      }
    } else {
      return res.status(401).send('Invalid request');
    }
};
