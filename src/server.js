const express=require('express')
const dotenv=require('dotenv')
const cookieParser = require('cookie-parser');
const cors=require("cors");
const errorHandler = require('./middlewares/errorHandlers');
const authRoutes=require('./routes/authRoute');
const contactRoutes=require('./routes/contactRoute');
const blogRoutes=require('./routes/blogRoute');
const projectRoute=require('./routes/projectRoute')
const HeroBrandRoute=require('./routes/HeroBrandRoute');

// load env files
dotenv.config();
 
// create express app
const app=express();

// middleware
app.use(cookieParser()); // first load cookies
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());


// error middleware
app.use(errorHandler)


// import routes
app.use("/api/auth",authRoutes);
app.use("/api/contact",contactRoutes);
app.use('/api/blog',blogRoutes);
app.use('/api/project',projectRoute);
app.use('/api/heroBrand',HeroBrandRoute);

// Test route
app.get("/", (req, res) => {
  res.send("Krrivah CMS Backend is Running ");
});


// start server
const PORT=process.env.PORT||4000;
app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`); 
});