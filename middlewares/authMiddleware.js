import JWT from 'jsonwebtoken';
//import userModel from '../models/userModel.js';

// Protected route token based
export const requireSignIn = async(req, res , next) => {
    try{
        const decode = JWT.verify(req.headers.authorization , process.env.JWT_SECRET);
        req.user = decode; 
        next();
    }
    catch(error){
        //console.log(error);
        res.status(500);
    }    
}
/*
// Admin access

export const isAdmin = async(req,res,next) => {
    try{
        const user = await userModel.findById(req.user._id);
        if(user.role !== 1){
            return res.status(401).send({
                success : false,
                message : "unathorized access"
            })
        }
        else{
            next();
        }
    }
    catch(error){
        res.status(401).send({
            success : false,
            message : "Error in admin middleware",
            error
        })
    }
}*/