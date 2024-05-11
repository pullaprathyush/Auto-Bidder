require("dotenv").config();
const {job}=require("./utils")
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const cors=require('cors');
const auctionRouter=require('./routes/auctionRoutes');
const userRouter=require('./routes/userRoutes');
const featureAdsRouter=require('./routes/FeatureAdsRoutes');
const LoginRouter=require('./routes/loginAuthentication');
const LogoutRouter=require('./routes/logoutRoute');
const SubscriptionRouter=require('./routes/subscriptionRoute');
var complaintRouter = require('./routes/complaint');
var mechanicRouter = require('./routes/mechanic');
var vehicleRouter = require('./routes/vehicle');
var sellerRouter = require('./routes/seller');
var bidderRouter = require('./routes/bidder');

var app = express();
app.use(cors({
    origin: process.env.interfaceURL,
    credentials: true 
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/user',userRouter);
app.use('/api/auction',auctionRouter);
app.use('/api/featureAds',featureAdsRouter);
app.use('/api/subscription',SubscriptionRouter);

app.use('/api', complaintRouter);
app.use('/api/mechanic', mechanicRouter);
app.use('/api/vehicle', vehicleRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/bidder', bidderRouter);

app.use('/api/login',LoginRouter);
app.use('/api/logout',LogoutRouter);
app.use('/static',express.static("public"))
job.start()
module.exports = app;