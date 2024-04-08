require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.SERVER_PORT | 3000;
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/mobileOtp')

const userRoute = require('./routes/userRoute')


app.use('/api',userRoute)
app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`)
})

