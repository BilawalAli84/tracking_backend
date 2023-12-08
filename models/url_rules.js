const mongoose = require('mongoose')

const urlScheme = new mongoose.Schema({
    user_id: { type: String, required: true },
    user_email: { type: String, required: true },
    path: { type: String, required: true },
    event: { type: String, required: false },
    tag: { type: String, required: false },
})

module.exports = mongoose.model('url_rules', urlScheme)