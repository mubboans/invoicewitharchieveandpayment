const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const invoiceSchema = new Schema({
    customerId: { 
        type: Schema.Types.ObjectId, ref: "customer" 
    },
    invoiceno: {
        type: Number,
        unique: true
    },
    invoicedate: {
        type: Date,
    },
    item: [{
        invoice_itemId: { 
            type: Schema.Types.ObjectId, ref: "invoice_item"
         },
        quatity: {
            type: Number,
            required:true
        }
    }
    ],
    totalamount: {
        type: Number
    }
});
// {"name":"Guard",
// "invoiceno":"B123",
// "invoicedate":"23/12/2022"
// "totalamount":12130
// }

module.exports = mongoose.model('invoice', invoiceSchema)
