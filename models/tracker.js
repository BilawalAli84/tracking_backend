const mongoose = require('mongoose')

const trackerScheme = new mongoose.Schema({
    current_url:{
        type : String,
        require : true
    },
    reference_url:{
        type : String,
        require : true
    },
    utm_source:{
        type : String,
        require : false
    },
    utm_medium:{
        type : String,
        require : false
    },
    utm_campaign:{
        type : String,
        require : false
    },
    utm_content:{
        type : String,
        require : false
    },
    utm_term:{
        type : String,
        require : false
    },
    session_id:{
        type : String,
        require : true
    },
    tracked_date:{
        type : Date,
        require : true,
        default : Date.now
    }
})

module.exports = mongoose.model('tracker', trackerScheme)