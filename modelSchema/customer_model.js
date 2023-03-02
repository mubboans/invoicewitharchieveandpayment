const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const customerSchema = new Schema({
    name:{
        required:true,
        type:String
    },
    email:{
        required:true,
        type:String,
        lowercase: true,
    },
    contact:{
        required:true,
        type:String
    },
    address:{
        line1:{required:true,
        type:String
        },
        line2:String,
        pincode:Number,
        city:String,
        country:String,
        state:String
    }

});
module.exports=mongoose.model('customer',customerSchema)
// {
//     "name":"Mubashir",
//     "email":"abcTest@gmail.com",
//     "contact":"987654321",
//     "address":{
//         "line1":"Byculla Hains Road"
//         "line2":"B J Marg",
//         "pincode":"400011",
//         "city":"Mumbai",
//         "country":"India",
//         "state":"Maharashtra"
//     }
// }
