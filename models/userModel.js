const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
    },
    profile:{
        public_id : {
            type : String,
            required : true,
        },
        url:{
            type: String,
            required: true,
        },
    },
    description:{
        type: String,
    },
    followers:[
        {
            type: mongoose.ObjectId,
            ref: 'users',
        },
    ],
    following:[
        {
            type: mongoose.ObjectId,
            ref:'users',
        },
    ],
    answer:{
        type: String,
        required: true,
    },
    role:{
        type: Number,
        default: 0,
    }
},{timestamps : true})

module.exports = mongoose.model("users" , userSchema);