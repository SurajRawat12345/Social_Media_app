import dotenv from "dotenv";
dotenv.config();
import tweetModel from "../models/tweetModel.js";

// Configuring Cloudinary
import * as Cloudinary from 'cloudinary';

Cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// To create Tweet
export const postController = async(req,res) => {
    try{
        const { tweetby , description , } = req.body;
        const result = await Cloudinary.uploader.upload(req.file.path);
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
}

// To delete Tweet
export const deletePostController = async(req,res) => {
    try{
        const {id} = req.params;
        const deletePost = await tweetModel.findByIdAndDelete({_id:id});
        res.status(200).send({
            success: true,
            msg: "Deleted Successfully",
            deletePost, 
        })
    }
    catch(error){
        res.status(500).send({
            success: false,
            msg: "Error in delting post",
            error,
        })
    }
}

// To count total Products
export const countConroller = async(req,res) => {
    try{
        const total = await tweetModel.find({}).estimatedDocumentCount();
        res.status(200).send({
            success : true,
            msg: "Counted successfully",
            total,
        });
    }
    catch(error){
        res.status(500).send({
            success : false,
            message : "Error while loading Products",
            error,
        })
    }
}

// To get all latest tweet
export const getallController = async(req,res) => {
    try{
        const perPage = 5;
        const page = req.params.page ? (req.params.page) : (1);
        const tweets = await tweetModel.find({})
        .populate('tweetby')
        .limit(perPage*page)
        .sort({createdAt: -1});
        res.status(200).send({
            success: true,
            msg: "Fetched all Tweets",
            tweets,
        })
    }
    catch(error){
        console.log(error);
        res.status(500).send({
            success: false,
            msg: "Error while loading Data",
            error,
        })   
    }
} 

// Own tweet by user._id
export const getOwnTweetsController = async(req,res) => {
    try{
        const {id} = req.params;
        const ownTweet = await tweetModel.find({tweetby : id}).sort({createdAt: -1});
        res.status(200).send({
            success: true,
            msg: "Fetched user Tweet",
            ownTweet,
        })
    }
    catch(error){
        res.status(500).send({
            success: true,
            msg: "Error in finding your tweets",
            error,
        })
    }
}

// Get tweet by id
export const getbyIdController = async(req,res) => {
    try{
        const {tid} = req.params;
        const singleTweet = await tweetModel.findOne({_id : tid})
        .populate(['tweetby','comment.commentby']);
        res.status(200).send({
            success: true,
            msg: "Fetched Properly",
            singleTweet,
        })
    }
    catch(error){
        res.status(500).send({
            success: false,
            msg: "Error in finding this tweet",
            error,
        })
    }
}

// Like Functionality
export const likeController = async(req,res) => {
    try{
        let num = 0;
        const {tid ,uid} = req.params;
        const likedtweet = await tweetModel.findOne({_id : tid });
        let array1 = await [...likedtweet.likes];
        for(let i in array1){
            if(array1[i] == uid){
                if (i > -1) { 
                    num = 1; 
                }
                break;
            }
        }
        if(num === 1){
            res.status(201).send({
                success: false,
                msg: "Already Liked",
            })
        }
        else{
            const updated = await tweetModel.findOneAndUpdate({_id: tid} , 
                {$push: { likes : uid }} ,{new:true});
            res.send({
                success: true,
                msg: "Liked Successfully",
                updated,
            })
        }
    }
    catch(error){
        //console.log(error);
        res.status(500).send({
            success: false,
            msg: "Error in finding your tweets",
            error,
        })
    }
}
// Dislike Functionality
export const dislikeController = async(req,res) => {
    try{
        let num = 0;
        const {tid ,uid} = req.params;
        const likedtweet = await tweetModel.findOne({_id : tid});
        let array1 = await [...likedtweet.likes];
        for(let i in array1){
            if(array1[i] == uid){
                if (i > -1) { 
                    array1.splice(i, 1);
                    num = 1; 
                }
                break;
            }
        }
        if(num === 1){
            const updatedLike = await tweetModel.findOneAndUpdate({_id: tid} , 
                {likes: array1} , {new: true});
            res.send({
                success: true,
                msg: "Disliked Successfully",
                updatedLike,
                likedtweet,
            })
        }
        else{
            res.status(201).send({
                success: false,
                msg: "You have not liked this tweet",
                array1,
            })
        }
    }
    catch(error){
        console.log(error);
        res.status(500).send({
            success: false,
            msg: "Error in disliking tweets",
            error,
        })
    }
}

// Comment Functionality
export const commentController = async(req,res) => {
    try{
        const {commentText} = req.body;
        const {tid ,uid} = req.params;
        const commenttweet = await tweetModel.findById({_id : tid});
        const updated = await tweetModel.findByIdAndUpdate({_id: tid} ,
            {comment: [ ...commenttweet.comment , {commentby:uid , text:commentText}]} ,{new:true});
        res.send({
            success: true,
            msg: "Comment added Successfully",
            updated,
        })
    }
    catch(error){
        console.log(error);
        res.send({
            success: false,
            msg: "Error in finding your tweets",
            error,
        })
    }
}

// Delete Comment Controller
export const deleteCommentController = async(req,res) => {
    try{
        const {tid,cid} = req.params;
        const delComment = await tweetModel.findByIdAndUpdate(
            ({_id : tid}),{ $pull: { comment: { _id : cid} } }, { new: true });
        res.status(200).send({
            success: true,
            msg: "Comment Deleted Successfully",
            delComment,
        })    
    }
    catch(error){
        console.log(error);
        res.status(500).send({
            success: false,
            msg:"Error in deleting Comment",
            error,
        })
    }
}