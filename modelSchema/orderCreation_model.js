const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const order_Create = new Schema({
    cf_order_id:{
        type:Number,
    },
    created_at:{
        type:String
    },
    customer_details:{
        customer_id: String,
        customer_name: String,
        customer_email: String,
        customer_phone: String
    },
    entity:{
        type:String,
    },
    order_amount:{
        type:Number
    },
    order_currency:{
        type:String,
    },
    order_expiry_time:{
        type:String,
    },
    order_id:{
        type:String,
    },
    order_meta:{
        return_url: String, notify_url: String, payment_methods: String
    },
    order_note:{
        type:String,
    },
    order_splits:{
        type:Array,
    },
    order_status:{
        type:String,
    },
    order_tags:{
        type:String,
    },
    payment_session_id:{
        type:String,
    },
    payments:{
        url:{type:String} 
    },
    refunds:{
        url:{type:String} 
    },
    settlements:{
        url:{type:String} 
    },
    transactionId:{
        type:String,
    },
    order_amount_recieve:{
        type:Number,
    }
})
module.exports = mongoose.model ('order_Create', order_Create)


