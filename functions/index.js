const functions = require("firebase-functions");
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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors());
app.options('*', cors());
var fileupload = require("express-fileupload");
app.use(fileupload());
app.get('/data',(req,res)=>{
    
    res.status(200).send({working:"Succesfull"});
});
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
        connectDB(dburl)
     
    }
    catch(err){
        console.log('Error form main',err);
    }
    console.log('listening on port',port);
});

// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started
exports.app = functions.https.onRequest(app)
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
