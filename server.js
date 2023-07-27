require("dotenv").config();
const express= require('express');
const cors = require("cors");
const multer = require('multer');
const mongoose = require('mongoose');
const morgan = require("morgan");
const userModel = require("./models/userModel.js");
const cloudinary = require('cloudinary').v2;
const hashPassword = require("./helpers/authHelper.js");
const tweetModel = require("./models/tweetModel.js")

const storage = multer.diskStorage({
    filename: function(req, file, cb) {
      cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();
const PORT = process.env.PORT || 8000;

mongoose.set('strictQuery', false); 
mongoose.connect(process.env.MONGO_URI , {useNewUrlParser : true , useUnifiedTopology : true})
.then(console.log("Connected DB"))

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static('public'));

// Testing route
app.get('/' , (req,res) => {
    res.status(200).send({msg : "Hello User"});
})

// Create Post
app.post('/api/v1/tweet/post-tweet', upload.single("file"), async(req,res) => {
    try{
        const { tweetby , description , } = req.body;
        const result = await cloudinary.uploader.upload(req.file.path);
        if(!tweetby){
            return res.status(409).send({message : "account name is required"});
        }
        if(!description){
            return res.status(409).send({message : "Description is required"});
        }
        const new_tweet = await new tweetModel({
            tweetby,
            description,
            image: {
                public_id : result.public_id, 
                url : result.secure_url
            },
        }).save()
        res.status(200).send({
            success : true,
            message : "Tweet Added successfully",
            new_tweet
        })
    }
    catch(error){
        //console.log(error);
        res.status(500).send({
            success: false,
            msg: "Error while posting",
            error,
        })
    }
})
// Update Profile Image
app.patch('/api/v1/user/update-profile/:id' , upload.single("file") , async(req,res) => {
    try{
        const { id } = req.params;
        const result = await cloudinary.uploader.upload(req.file.path)
        const update = await userModel.findOneAndUpdate({_id : id} , {   
            profile: {
                    public_id : result.public_id, 
                    url : result.secure_url,
                }
            },
            { new: true} 
        )
        res.status(200).send({
            success: true,
            msg: "Updated Profile Successfully",
            update,
        })
    }
    catch(error){
        //console.log(error);
        res.status(500).send({
            success: false,
            msg:"Error in uploading Image",
            error,
        })
    }
})

// Register
app.post('/api/v1/user/register', upload.single('file'), async(req, res)=>{
    try {
        const { name , email , password , description, answer} = req.body;
        if(!name || !email || !password || !description || !answer ){
            res.status(409).send({ msg : "Enter all fields"})
        }
        // Check an Existing user
        const existing = await userModel.findOne({email})
        if(existing){
            return res.status(200).send({
                success : false,
                message : "Already Registered please login",
            })
        }
        // Registering user
        const hashedPass = await hashPassword(password);
        const result = await cloudinary.uploader.upload(req.file.path);

        const user1 = await new userModel({
            name,
            email,
            password:hashedPass,
            profile: {
                public_id : result.public_id, 
                url : result.secure_url
            },
            description,
            answer
        }).save()
        res.status(200).send({ 
            success : true,
            msg : "User Created Successfully",
            user1,
        });
    } catch (err) {
        //console.log(err);
        res.status(500).send({ 
            success : false,
            msg : "User Not Added",
            err,
        });
    }
});

// Connection
app.listen(PORT , () => {
    console.log(`Server is running on port ${PORT}`);
})