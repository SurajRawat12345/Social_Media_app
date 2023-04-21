import express from "express";
const router = express.Router();
import { requireSignIn } from "../middlewares/authMiddleware.js";
import { 
    postController,
    deletePostController,
    countConroller,
    getallController,
    getOwnTweetsController,
    getbyIdController,
    likeController,
    dislikeController,
    commentController,
    deleteCommentController,
} from "../controllers/tweetController.js";
import multer from 'multer';

const storage = multer.diskStorage({
    filename: function(req, file, cb) {
      cb(null, file.originalname);
    }
  });
const upload = multer({ storage: storage });

// Upload Post
router.post('/post-tweet' , upload.single('file') , requireSignIn  , postController);

// delete Post
router.delete('/delete-tweet/:id' , requireSignIn , deletePostController);

// Get Count of Posts
router.get('/count-tweet' , countConroller);

// Get All Posts
router.get('/all-tweets/:page' ,getallController);

// Get Own Posts
router.get('/own-tweet/:id', requireSignIn ,getOwnTweetsController);

// Get tweet by id
router.get('/find-tweet/:tid' , requireSignIn , getbyIdController);

// Like Controller
router.patch('/update-tweet-like/:tid/:uid' , requireSignIn , likeController);

// Like Controller
router.patch('/update-tweet-dislike/:tid/:uid' , requireSignIn , dislikeController);

// Comment Controller
router.patch('/update-tweet-comment/:tid/:uid', requireSignIn , commentController);

// Comment delete
router.patch('/delete-tweet-comment/:tid/:cid' , requireSignIn , deleteCommentController);

export default router;