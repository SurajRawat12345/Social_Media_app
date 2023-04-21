import mongoose from "mongoose";

const tweetSchema = new mongoose.Schema({
    tweetby:{
        type: mongoose.ObjectId,
        ref: 'users',
    },
    description:{
        type: String,
        required: true,
    },
    image:{
        public_id : {
            type : String,
            default: "",
        },
        url:{
            type: String,
            default: "",
        },
    },
    likes:[
        {
            type : mongoose.ObjectId,
            ref : 'users',
        },
    ],
    comment:[{
        commentby:{
            type: mongoose.ObjectId,
            ref: 'users',
        },
        text:{
            type: String,
            trim: true,
            required: true
        },
        date:{
            type: Date,
            default: Date.now
        }
    }]
},{timestamps:true});

export default mongoose.model("tweets" , tweetSchema);