const invoiceItemSchema = require('../modelSchema/invoice_item_model')

const addinvoiceitem = (req,res)=>{
    let invoiceitemmodel = new invoiceItemSchema(req.body);
    invoiceitemmodel.save(invoiceitemmodel,(err,obj)=>{
        if(err){
            res.status(400).send({message:"Can't Post Invoice Item",error:err})
        }
        else{
            res.status(201).send({message:"Added Invoice-Item Succesfull",success:true})
        }
    })
} 
const upateInvoiceItem = (req,res)=>{
    let id =req.params.id
    id = id.replace(":",""); 
    let invoiceItem = req.body;
    invoiceItemSchema.findByIdAndUpdate({_id:id},invoiceItem,(err,obj)=>{
        if(err){
            res.status(400).send({message:"Can't Update Item",error:err})
        }
        else{
            res.status(200).send({message:"Update Item Successfully",success:true})
        }
    })
}
const getinvoiceitem = (req,res)=>{

    invoiceItemSchema.find().sort({ _id: -1 }).exec((err,obj)=>{
        console.log(err,obj,'bot check');
        if(err){
            console.log('get item calledd');
            res.status(400).send({message:"Can't find Item",error:err})
        }
        else{
            console.log('get item calledd');
            res.status(200).send({message:"Get Successfull Item",data:obj,success:true})
        }
    })
}
 const deleteinvoiceItem = (req,res)=>{
    let id =req.params.id
    id = id.replace(":","");
    invoiceItemSchema.findByIdAndDelete({_id:id},(err,obj)=>{
        if(err){
            res.status(400).send({message:"Can't Delete Item",error:err})
        }
        else{
            res.status(200).send({message:"Delete Item Successfully",success:true})
        }
    })

 }
module.exports = {
    addinvoiceitem,
    getinvoiceitem,
    upateInvoiceItem,
    deleteinvoiceItem
}