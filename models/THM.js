const mongoose = require("mongoose");

const TempHumiMoiSchema = mongoose.Schema({

    device_name : {
        type : String,
        required : true
    },
    temp : {
        type : String,
        required : true
    },
    humi : {
        type : String,
        required : true
    },
    mois : {
        type : String,
        required : true
    },
    // created_at : {
    //     type : Date,
    //     default : Date.now
    // },
    created_date : {
        type : String,
        required : true        
    },
    created_time : {
        type : String,
        required : true
    }

});

module.exports = mongoose.model("dodam_DTHM2", TempHumiMoiSchema);