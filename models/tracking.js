const mongoose = require('mongoose')

const trackingScheme = new mongoose.Schema({
    user_id: { type: String, required: true },
    user_email: { type: String, required: true },
    domain: { type: String, required: true },
    webUrl: { type: String },
    pixelId: { type: String },
    access_token: { type: String },
    event: { type: String },
    googleId: { type: String },
    google_event_id: { type: String },
    tag: { type: String },
    test_code: { type: String }
})

module.exports = mongoose.model('tracking', trackingScheme)