import dotenv from "dotenv";
dotenv.config();
import userModel from '../models/userModel.js';
import { comparePassword, hashPassword } from './../helpers/authHelper.js';
import JWT from 'jsonwebtoken';

// Configuring Cloudinary
import * as Cloudinary from 'cloudinary';

Cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const test = (req,res) => {
    try{
        res.status(200).send({
            success: true,
            msg: "Hello User",
        });
    }
    catch(error){
        res.status(500).send({
            success: false,
            msg: "Something Went Wrong",
            error,
        })
    }
}

// ----------------------- SIGNUP OR REGISTER ---------------------------
export const registerController = async(req,res) => {
    try{
        const { name , email , password , description, answer} = req.body;

        // For image upload on cloudinary
        const result = await Cloudinary.uploader.upload(req.file.path);
        
        // Blank Field Validation
        if(!name){
            return res.send({message : "Name is required"})
        }
        if(!email){
            return res.send({message : "Email is required"})
        }
        if(!password){
            return res.send({message : "password is required"})
        }
        if(!answer){
            return res.send({message : "Answer is required"})
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
            message : "User Registered successfully",
            user1
        })
    }
    catch(error){
        //console.log(error);
        res.status(500).send({
            success : false,
            message : "Error in registration",
            error
        })
    }
}

// --------------------------- LOGIN ---------------------------------
export const loginController = async(req,res) => {
    try{
        const {email , password} = req.body;
        // validation
        if(!email || !password){
            return res.status(404).send({
                success : false,
                message : "Invalid login credentials"
            })
        }
        const user = await userModel.findOne({email})
        if(!user){
            return res.status(404).send({
                success : false,
                message : "Email is not registered"
            })
        }
        const match = await comparePassword(password , user.password)
        if(!match){
            return res.send({
                success : false,
                message : "Invalid password"
            })
        };
        // token creation
        const token = await JWT.sign({ _id : user._id} , process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).send({
            success : true,
            message : "login successfully",
            user : {
                _id : user._id,
                name : user.name,
                email : user.email,
                profile : user.profile,
                description : user.description,
                followers : user.followers,
                folowing : user.following,
            },
            token,
        })
    }
    catch(error){
        res.status(500).send({
            success : false,
            message : "Error in login",
            error
        })
    }
}

// forgot password controller
export const forgotPasswordController = async(req,res) => {
    try{
        const {email , answer , newPassword} = req.body;
        if(!email){
            res.status(400).send({message : "Email is required"})
        }
        if(!answer){
            res.status(400).send({message : "answer is required"})
        }
        if(!newPassword){
            res.status(400).send({message : "New Password is required"})
        }
        // check
        const usercheck = await userModel.findOne({email,answer})
        //validation
        if(!usercheck){
            res.status(404).send({
                success : false,
                message : "Wrong email or answer"
            })
        }
        else{
            const hashed = await hashPassword(newPassword);
            await userModel.findByIdAndUpdate(usercheck._id , {password : hashed});
            res.status(200).send({
                success : true,
                message : "Password Reset Successfully"
            })
        }
    }
    catch(error){
        console.log(error);
        res.status(500).send({
            success : false,
            message : "Something went wrong",
            error
        })
    }
}

// Update profile picture
export const updateProfileController = async(req,res) => {
    try{
        const {id} = req.params;
        const result = await Cloudinary.uploader.upload(req.file.path);
        const update = await userModel.findOneAndUpdate(
            {_id : id} ,
            {profile: {
                public_id : result.public_id, 
                url : result.secure_url
            },},
            {new: true}
        )
        res.status(200).send({
            success: true,
            msg: "Updated Profile Successfully",
            update,
        })
    }
    catch(error){
        res.status(500).send({
            success: false,
            msg:"Error in uploading Image",
            error,
        })
    }
}

// Update name
export const updateNameController = async(req,res) => {
    try{
        const {id} = req.params;
        const {name} = req.body;
        const update = await userModel.findOneAndUpdate({_id : id} ,{name: name},{new: true})
        res.status(200).send({
            success: true,
            msg: "Updated Name Successfully",
            update,
        })
    }
    catch(error){
        res.status(500).send({
            success: false,
            msg:"Error in Updating Name",
            error,
        })
    }
}

// Update description
export const updateDescriptionController = async(req,res) => {
    try{
        const {id} = req.params;
        const {desc} = req.body;
        const update = await userModel.findOneAndUpdate({_id : id} ,{description: desc},{new: true})
        
        res.status(200).send({
            success: true,
            msg: "Updated Description Successfully",
            update,
        })
    }
    catch(error){
        res.status(500).send({
            success: false,
            msg:"Error in Updating Description",
            error,
        })
    }
}

// Find user by name
export const findUserController = async(req,res) => {
    try{
        const {keyword} = req.params;
        const users = await userModel.find({
            name: { $regex : keyword , $options : 'i'}, 
        }).select(["-answer","-role" ,"-email", "-password"])
        res.send({
            success: true,
            msg: "User Found",
            users,
        })
    }
    catch(error){
        res.status(500).send({
            success: false,
            msg: "Error in finding user",
            error,
        })
    }
}

// Find user by id
export const getUserbyIdController = async(req,res) => {
    try{
        const {id} = req.params;
        const singleUser = await userModel.findOne({_id : id}).select(["-password","-answer"]);
        res.status(200).send({
            success: true,
            msg: "Fetched Properly",
            singleUser,
        })
    }
    catch(error){
        //console.log(error);
        res.status(500).send({
            success: false,
            msg: "Error in finding single user",
            error,
        })
    }
}

// Follow Controller
export const followController = async(req,res) =>{
    try{
        const {fid,uid} = req.params;
        if(fid === uid){
            res.status(400).send({
                success: false,
                msg:"Same id cannot be followed",
            })
        }
        else{
            let num = 0;
            const followedUser = await userModel.findOne({_id : fid});
            const followingUser = await userModel.findOne({_id : uid});
            let array1 = await [...followedUser.followers];
            for(let i in array1){
                if(array1[i] === uid){
                    num = 1;
                    break;
                }
            }
            if(num !== 1){
                const updated = await userModel.findOneAndUpdate({_id: fid} , 
                    {followers:[...followedUser.followers , uid]} ,{new:true});
                const updateFollowers = await userModel.findOneAndUpdate({_id : uid},
                    {following:[...followingUser.following , fid]} , {new:true});       
                res.send({
                    success: true,
                    msg: "Followed User Successfully",
                    updateFollowers,
                })
            }
            else{
                res.status(201).send({
                    success: false,
                    msg: "Already Following",
                })
            }
        }
    }
    catch(error){
        res.status(500).send({
            success: false,
            msg: "Error in Following",
            error,
        })
    }
}

// Unfollow Controller
export const unfollowController = async(req,res) => {
    try{
        let num = 0;
        let num2 = 0;
        const {fid ,uid} = req.params;
        const unfollowedUser = await userModel.findOne({_id : fid});
        const unfollowingUser = await userModel.findOne({_id : uid});
        let array1 = await [...unfollowedUser.followers];
        let array2 = await [...unfollowingUser.following];
        for(let i in array1){
            if(array1[i] == uid){
                if (i > -1) { 
                    array1.splice(i, 1);
                    num = 1; 
                }
                break;
            }
        }
        for(let i in array2){
            if(array2[i] == fid){
                if (i > -1) { 
                    array2.splice(i, 1);
                    num2 = 1; 
                }
                break;
            }
        }
        if(num === 1 && num2 === 1){
            const updatedfollowers = await userModel.findOneAndUpdate({_id: fid} , 
                {followers: array1} , {new: true});
            const updatedfollowing = await userModel.findByIdAndUpdate({_id : uid},
                {following : array2},{new:true});    
            res.send({
                success: true,
                msg: "Unfollowed Successfully",
                updatedfollowing,
            })
        }
        else{
            res.status(409).send({
                success: false,
                msg: "You have not followed",
                array1,
            })
        }
    }
    catch(error){
        res.status(500).send({
            success: false,
            msg: "Error in unfollowing User",
            error,
        })
    }
}