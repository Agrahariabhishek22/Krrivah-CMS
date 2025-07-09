const express=require('express')
const dotenv=require('dotenv')
const cors=require("cors");
const errorHandler = require('./middlewares/errorHandlers');

// load env files
dotenv.config();

// create express app
const app=express();

// middleware
app.use(express.json());
app.use(cors());

// error middleware
app.use(errorHandler)

// Test route
app.get("/", (req, res) => {
  res.send("Krrivah CMS Backend is Running ");
});


// start server
const PORT=process.env.PORT||4000;
app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`); 
});