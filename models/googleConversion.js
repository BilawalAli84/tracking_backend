const mongoose = require('mongoose')

const conversionScheme = new mongoose.Schema({
    user_id: { type: String, required: true },
    user_email: { type: String, required: true },
    google_id: { type: String, required: true },
    event_id: { type: String, required: true },
    event_name: { type: String, required: true },
})

module.exports = mongoose.model('googleConversion', conversionScheme)