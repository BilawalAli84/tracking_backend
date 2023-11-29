const User = require('../models/user');
const Tracking = require('../models/tracking');
const Conversion = require('../models/conversion');
const Domain = require('../models/domain');
const UrlRules = require('../models/url_rules');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const generateScriptKey = () => {
    const minLength = 32;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let scriptKey = '';
  
    while (scriptKey.length < minLength) {
      scriptKey += characters[Math.floor(Math.random() * characters.length)];
    }
  
    return scriptKey;
  };
exports.tracking = async (req, res, next) => {
    if (req.headers['authorization']) {
        try {
            let authorization = req.headers['authorization'].split(' ');
            if (authorization[0] !== 'Bearer') {
                return res.status(401).send('invalid request'); //invalid request
            } else {
                req.jwt = jwt.verify(authorization[1], process.env.TOKEN_SECRET);
                const userData = req.jwt;

                const conversionData = await Conversion.findOne({
                    user_id: userData.userId,
                    pixel_id: req.body.pixelId,
                  });
          
                  // Fetch event from UrlRules model
                  const urlRulesData = await UrlRules.findOne({
                    user_id: userData.userId,
                    path: req.body.webUrl,
                  });
          
                  if (!conversionData || !urlRulesData) {
                    return res.status(400).json({ success: false, message: 'Invalid pixelId or webUrl' });
                  }
          
                // Generating a random script_key
                const script_key = generateScriptKey();

                // Creating a new user instance
                const tracking = new Tracking({
                    user_id: userData.userId,
                    user_email: userData.email,
                    domain: req.body.domain,
                    webUrl: req.body.webUrl,
                    pixelId: req.body.pixelId,
                    access_token:conversionData.access_token,
                    event:urlRulesData.event,
                    test_code:conversionData.test_code
                });

                // Save the user to the database
                await tracking.save();

                return res.status(200).json({ success: true, message: 'Script key generated successfully', script_key });
            }
        } catch (err) {
            console.error('Error verifying token:', err);
            return res.status(403).send(err);
        }
    } else {
        return res.status(401).send('invalid request');
    }
}