import express from "express";
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bodyParser from "body-parser"
import cors from 'cors';
import Razorpay from "razorpay"
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';



// ROUTERS
import userRouter from "./routers/user.router";
import productRouter from "./routers/product.router";
import orderRouter from "./routers/order.router";
import cartRouter from "./routers/cart.router";
import payRouter from "./routers/payment.router";
import wishRouter from "./routers/wishlist.router";
import categoryRouter from "./routers/category.router";

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const port = process.env.PORT || 4000

var corsOptions = {
    origin:  [
      process.env.REACT_URL1,
      process.env.REACT_URL2,
      process.env.DEPLOYMENT_URL
  ],
    optionsSuccessStatus:200
  }
  app.use(cors(corsOptions));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// app.use(cookieParser())

// app.listen(port, ()=>{
//     console.log(`App running on port ${port}`)
// })

mongoose.connect(`${process.env.MONGO_URL}/dazzle`)
  .then(() => console.log(`Connected to Dazzle!`))
  .catch(()=> console.log(`Error connecting to database`));

 
app.use('/dazzle/user', userRouter)  
app.use('/dazzle/product', productRouter)  
app.use('/dazzle/cart', cartRouter)  
app.use('/dazzle/order', orderRouter)  
app.use('/dazzle/checkout', payRouter)  
app.use('/dazzle/wishlist', wishRouter)  
app.use('/dazzle/category', categoryRouter)  


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: 'dazzle-app' }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(buffer);
  });

app.post('/dazzle/upload', upload.single('image'), async (req, res) => {
  try {
    const result = await uploadToCloudinary(req.file.buffer);
    res.json({ url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export const instance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});


export default app;