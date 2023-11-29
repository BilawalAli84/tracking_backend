const User = require('../models/user');
const Domain = require('../models/domain');
const jwt = require('jsonwebtoken');

exports.domain_tracking = async (req, res, next) => {
    if (req.headers['authorization']) {
        try {
            let authorization = req.headers['authorization'].split(' ');
            if (authorization[0] !== 'Bearer') {
                return res.status(401).send('Invalid request'); // Invalid request
            } else {
                req.jwt = jwt.verify(authorization[1], process.env.TOKEN_SECRET);
                const userData = req.jwt;

                // Check if the domain has a valid syntax
                const isValidDomain = /^https?:\/\/[^\/]+\..+$/.test(req.body.domain.trim());

                if (!isValidDomain) {
                    return res.status(400).json({ success: false, message: 'Invalid domain syntax. Please enter a valid domain (e.g., https://example.com).' });
                }

                const domain = new Domain({
                    user_id: userData.userId,
                    user_email: userData.email,
                    domain: req.body.domain
                });

                // Save the user to the database
                await domain.save();

                return res.status(200).json({ success: true, message: 'Domain Registered Successfully!'});
            }
        } catch (err) {
            console.error('Error verifying token:', err);
            return res.status(403).send(err);
        }
    } else {
        return res.status(401).send('Invalid request');
    }
};

exports.get_domains = async (req, res, next) => {
    if (req.headers['authorization']) {
      try {
        let authorization = req.headers['authorization'].split(' ');
        if (authorization[0] !== 'Bearer') {
          return res.status(401).send('Invalid request'); // Invalid request
        } else {
          req.jwt = jwt.verify(authorization[1], process.env.TOKEN_SECRET);
          const userData = req.jwt;
  
          // Retrieve all domains for the user_id
          const userDomains = await Domain.find({ user_id: userData.userId });
  
          // Extract domain values from the userDomains array
          const domains = userDomains.map((userDomain) => userDomain.domain);
  
          return res.status(200).json({ success: true, domains });
        }
      } catch (err) {
        console.error('Error verifying token:', err);
        return res.status(403).send(err);
      }
    } else {
      return res.status(401).send('Invalid request');
    }
};
