import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoute.js";
import tweetRoute from "./routes/tweetRoute.js";

// Configuring dotenv file
dotenv.config();

// Connecting Database
mongoose.set('strictQuery', false);

mongoose.connect(process.env.MONGO_URI , {
    useNewUrlParser : true , 
    useUnifiedTopology : true
})
.then(console.log("Connected DB"))

const app = express();
const port = process.env.PORT || 8080;

//middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended : true}));

//routes

app.use('/api/v1/user' , userRoutes);
app.use('/api/v1/tweet' , tweetRoute);
app.get('/', async(req,res) => {
    res.send({
        success: true,
        msg: "Hello World",
    })
})

// Running server on a port
app.listen(port , () => {
    console.log(`Server is running on port ${port}`);
})