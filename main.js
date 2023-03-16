require('dotenv').config();
const express = require('express');
const port = process.env.PORT;

const app=express();
const cors = require('cors')
const bodyParser = require('body-parser');
const dburl = process.env.DBURL;
const connectDB = require('./dbconfig/db-config');
const custroute= require('./route/cutomer_route');
const invoiceitemroute = require('./route/invoice_item_route');
const invoiceroute = require('./route/invoice_route.js')
const notFound = require('./middleware/404-notfound');
// const errorHandle = require('./middleware/failed-error');
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
app.use('',custroute);
app.use('',invoiceitemroute);
app.use('',invoiceroute);

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
