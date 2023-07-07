
const mongoose = require('mongoose');
 function connectDB(urlstring){
    mongoose.connect(urlstring, {useNewUrlParser:true})
    const db = mongoose.connection;
    db.once('open' , () => console.log('Connected to db',urlstring));
    db.on('error',(err)=>{console.error(err);})
    // also we can use arrow function 
    // ,(error,succes)=>{
    //     if(error){
    //         console.log(error);
    //     }
    //     else{
    //         console.log();
    //     }
    // }
}

module.exports= connectDB