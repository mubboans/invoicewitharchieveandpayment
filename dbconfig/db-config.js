const mongoose = require('mongoose');
 function connectDB(urlstring){
    mongoose.connect(urlstring,(err,succ)=>{
        if(err){
            console.log("Error in Connection",err);
        }
        else{
            console.log("Connect To ",urlstring);
        }
    })
}
module.exports= connectDB