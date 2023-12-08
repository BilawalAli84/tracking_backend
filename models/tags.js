const mongoose = require('mongoose')

const tagsScheme = new mongoose.Schema({
    script_key:{
        type : String,
        require : true
    },
    user_id:{
        type : String,
        require : true
    },
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
    },
    email_input:{
        type : String,
        require : false
    },
    first_name:{
        type : String,
        require : false
    },
    last_name:{
        type : String,
        require : false
    },
    fbp:{
        type : String,
        require : false
    },
    fbc:{
        type : String,
        require : false
    },
    data1:{
        type : String,
        require : false
    },
    data5:{
        type : String,
        require : false
    },
    track_type:{
        type : String,
        require : false
    },
    ip:{
        type : String,
        require : false
    },
    useragent:{
        type : String,
        require : false
    },
    tag:{
        type : String,
        require : false
    }
})

module.exports = mongoose.model('tags', tagsScheme)