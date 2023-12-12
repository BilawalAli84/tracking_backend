const express = require('express');
const router = express.Router();
const Tracker = require('../models/tracker');
const Events = require('../models/events_info');
const axios = require('axios'); // Import Axios for making HTTP requests
const crypto = require('crypto');
const { signup, signin, get_api_key } = require('../controllers/auth');
const { tracking, get_events } = require('../controllers/tracking');
const { domain_tracking, get_domains } = require('../controllers/domain');
const { add_conversions,get_conversion } = require('../controllers/facebookConversion');
const { add_google_conversions,get_google_conversion } = require('../controllers/googleConversion');
const { add_url,get_url } = require('../controllers/url_rules');
const { tracked_data,all,unique_optins } = require('../controllers/tracked_data');
const { get_tags,get_tag_data } = require('../controllers/tags');
const { add_lead_by_api, update_lead_by_api } = require('../controllers/public_api');
const Tracking = require('../models/tracking');
const jwt = require('jsonwebtoken');

router.post('/signup', signup);
router.get('/get_api_key', get_api_key);
router.post('/signin', signin);
router.post('/tracking', tracking);
router.post('/domain', domain_tracking);
router.get('/get_domains', get_domains);
router.post('/facebook-conversion', add_conversions);
router.post('/google-conversion', add_google_conversions);
router.get('/get_conversion', get_conversion);
router.get('/get_google_conversion', get_google_conversion);
router.post('/url_rules', add_url);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
router.get('/get_urls', get_url);
router.post('/get_events', get_events);
router.post('/', tracked_data);
router.get('/all', all);
router.get('/unique_optins', unique_optins);
router.get('/get_tags', get_tags);
router.get('/get_tag_data', get_tag_data);
router.post('/add_lead', add_lead_by_api);
router.put('/update_lead', update_lead_by_api);



module.exports = router;

