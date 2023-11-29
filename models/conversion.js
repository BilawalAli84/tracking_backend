const mongoose = require('mongoose')

const conversionScheme = new mongoose.Schema({
    user_id: { type: String, required: true },
    user_email: { type: String, required: true },
    pixel_id: { type: String, required: true },
    access_token: { type: String, required: true },
    test_code: { type: String, required: false },
})

module.exports = mongoose.model('conversion', conversionScheme)