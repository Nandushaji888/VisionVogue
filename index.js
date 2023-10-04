const mongoose = require('mongoose')
const express = require('express');
const userRoute = require('./routes/userRoute')
const adminRoute = require('./routes/adminRoute')
const nocache = require('nocache')
const path = require('path')
const logger = require('morgan')
require("dotenv").config();
    

const app = express();

app.set('view engine', 'ejs')
mongoose.connect(process.env.MONGODBURL)
app.use(nocache())
app.use('/assets',express.static(path.resolve(__dirname,'public/assets')))
app.use('/assets2',express.static(path.resolve(__dirname,'public/assets2')))
app.use('/js',express.static(path.resolve(__dirname,'public/assets/js')))



 //for user routes
app.use(logger('dev'))
app.use('/', userRoute)
app.use('/admin', adminRoute)


app.listen(3000,() => {
    console.log('server is running in http://localhost:3000');
})