import express from "express";
const router = express.Router();
import { 
    test, 
    registerController,
    loginController,
    forgotPasswordController,
    updateProfileController,
    updateNameController,
    updateDescriptionController,
    findUserController,
    getUserbyIdController,
    followController,
    unfollowController,
} from "../controllers/userController.js";
import multer from 'multer';
import { requireSignIn } from './../middlewares/authMiddleware.js';

const storage = multer.diskStorage({
    filename: function(req, file, cb) {
      cb(null, file.originalname);
    }
  });
const upload = multer({ storage: storage });

// Testing Routes
router.get("/" , test);

// Register Route
router.post('/register' , upload.single('file') ,registerController);

// Login Route
router.post('/login' , loginController);

// Forgot-Password Route
router.post('/forgot-password', forgotPasswordController);

// Update profile route
router.patch('/update-profile/:id', upload.single('file'), requireSignIn, updateProfileController);

// Update name 
router.patch('/update-name/:id' , requireSignIn , updateNameController);

// Update name 
router.patch('/update-desc/:id' , requireSignIn , updateDescriptionController);

// Find user by name
router.get('/find-user/:keyword' , requireSignIn , findUserController);

// Find user by Id
router.get('/user-id/:id' , requireSignIn , getUserbyIdController);

// Follow User
router.patch('/follow/:fid/:uid' , requireSignIn , followController);

// Unfollow User
router.patch('/unfollow/:fid/:uid' , requireSignIn , unfollowController);

export default router;