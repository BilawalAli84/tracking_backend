const mongoose = require('mongoose')

const trackerScheme = new mongoose.Schema({
    unique_id: {
        type: String,
        required: false,
    },
    domain_name: {
        type: String,
        required: false,
    },
    web_url: {
        type: String,
        required: false,
    },
    event_name: {
        type: String,
        required: false,
    },
    access_token: {
        type: String,
        required: false,
    },
    pixel_id: {
        type: String,
        required: false,
    }
})

module.exports = mongoose.model('events_info', trackerScheme)