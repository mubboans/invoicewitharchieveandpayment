const express = require('express');
const port = 3000;
const app=express();
const cors = require('cors')
const bodyParser = require('body-parser');
const dburl="mongodb+srv://mubbo:Mubashir30@cluster0.xzkwekg.mongodb.net/?retryWrites=true&w=majority"
const connectDB = require('./dbconfig/db-config');
const custroute= require('./route/cutomer_route');
const invoiceitemroute = require('./route/invoice_item_route');
const invoiceroute = require('./route/invoice_route.js')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors());
app.options('*', cors());
app.get('/data',(req,res)=>{
    
    res.status(200).send({working:"Succesfull"});
})
app.use('',custroute);
app.use('',invoiceitemroute);
app.use('',invoiceroute);
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
