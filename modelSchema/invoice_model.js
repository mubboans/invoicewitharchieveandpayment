const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const invoiceSchema = new Schema({
    customerId: { 
        type: String, ref: "customer" 
    },
    custdata:{
        type: Schema.Types.ObjectId, ref: "customer" 
    },
    invoiceno: {
        type: Number,
        require: true, index:true, unique:true,sparse:true
    },
    invoicedate: {
        type: Date,
    },
    createdOn:{
        type:Date,
    },
    item: [{
        invoice_itemId: { 
            type: String,
         },
          invoice_data: { 
            type: Schema.Types.ObjectId, ref: "invoice_item"
         },

        quantity: {
            type: Number,
            required:true
        }
    }
    ],
    totalamount: {
        type: Number
    }
});

module.exports = mongoose.model('invoice', invoiceSchema)
