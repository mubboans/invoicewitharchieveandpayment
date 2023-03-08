const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const invoiceitemSchema = new Schema({
    itemno: Number,
    name:{type: String,required:true},
    itemprice:{type: String,required:true},
    inventoryStatus:{type :String,required:true},
    category:{type :String,required:true}
});
// {"item":[{"itemno": 1,"name": "Keyboard","itemprice":"100"}]}
module.exports=mongoose.model('invoice_item',invoiceitemSchema)
