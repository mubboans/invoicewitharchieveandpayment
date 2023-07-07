require('dotenv').config();
const express = require('express');
const port = process.env.PORT;

const bulkroute = require('./route/pdf_route');
const app=express();
const cors = require('cors')
const bodyParser = require('body-parser');
const dburl = process.env.DBURL;
const connectDB = require('./dbconfig/db-config');
const custroute= require('./route/cutomer_route');
const invoiceitemroute = require('./route/invoice_item_route');
const invoiceroute = require('./route/invoice_route.js')
const notFound = require('./middleware/404-notfound');
const paymentRoute = require('./route/payment-route');
const path = require('path');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors());
app.options('*', cors());
var fileupload = require("express-fileupload");
const { connectRedis } = require('./utils/redisCache');
app.use(fileupload());
app.get('/data',(req,res)=>{
    
    res.status(200).send({working:"Succesfull"});
});
app.use('/zipped', express.static(path.join(__dirname, './zipped')));
// app.use(errorHandle);
app.use('',bulkroute)
app.use('',custroute);
app.use('',invoiceitemroute);
app.use('',invoiceroute);
app.use('',paymentRoute);
app.use(notFound)
app.set('view engine', 'ejs')
app.listen(port,()=>{
    try{
        connectRedis();
        // console.log(dburl,'connection string');
        connectDB(dburl)
    }
    catch(err){
        console.log('Error form main',err);
    }
    console.log('listening on port',port);
});
