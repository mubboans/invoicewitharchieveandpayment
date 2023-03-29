const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const invoiceArchive = new Schema({
    filename: { type: String,
        required: [true, 'Provide Name to File']
    },
    filedate:{
        type:Date,
        default:Date.now()
    },
    filelength:{
        type:Number,
    },
    status:{type: String,
        required: [true, 'Provide Status']
    },
    startTime: {
        type: Date,
    
      },
      endTime: {
        type: Date,
        
      },
    timeTaken:{
        type: String,
        required: true
    },
    filePath:{
        type:String,
        required:[true,'File Path Required']
    }
}
)
module.exports = mongoose.model('invoiceArchive', invoiceArchive)