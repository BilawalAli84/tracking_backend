const mongoose = require('mongoose')

const domainScheme = new mongoose.Schema({
    user_id: { type: String, required: true },
    user_email: { type: String, required: true },
    domain: { type: String, required: true }
})

module.exports = mongoose.model('domain', domainScheme)