const invoiceSchema = require('../modelSchema/invoice_model')
const invoiceItemSchema = require('../modelSchema/invoice_item_model')
const CustomerSchema = require('../modelSchema/customer_model')
const path = require('path');
const addInvoice =async (req,res)=>{
    let invoicemodel = new invoiceSchema(req.body);
    invoicemodel.custdata = invoicemodel.customerId;
    for(let j=0;j<invoicemodel.item.length;j++){
        invoicemodel.item[j].invoice_data= invoicemodel.item[j].invoice_itemId
    }
    var d = new Date().toISOString().slice(0, 10).toString(); 
    d= d.replace("-","")
    d= d.replace("-","")
    var randomnum = Math.floor(Math.random() * (10000 -  100)) + 10000;
    invoicemodel.createdOn = d;
    const userIds = req.body.item.map(user => user.invoice_itemId.replace("new ObjectId()",""));
    const quatitys=req.body.item.map(user => user.quantity);

    let Items=await invoiceItemSchema.find({_id: { $in: userIds}},{_id:0,__v: 0})
    console.log('id check',Items);
    let totalAmount=0
    for(let i = 0;i < Items.length;i++){   
        totalAmount += Items[i].itemprice * quatitys[i]        
    }
    invoicemodel.totalamount = totalAmount;
    console.log(userIds,'ids are',Items,quatitys,totalAmount,invoicemodel.custdata);
    invoiceSchema.create(invoicemodel,(err,obj)=>{
        if(err){
            res.status(400).send({message:"Can't Post Invoice",error:err.message})
        }
        else{
            res.status(201).send({message:"Added Invoice Succesfull",succes:true})
        }
    })
} 
const deleteSelected = async (req,res)=>{
    let ids = req.body.ids
    console.log(ids);
    invoiceSchema.deleteMany({ _id:{ $in: ids }},(err,obj)=>{
        if(err){
            res.status(400).send({message:"Can't Delete Invoices with Ids",error:err})  
        }
        else{
            let datalength = 0;
            if (ids.length > 0){
                datalength = ids.length > 0 ? ids.length : 0; 
            }
            res.status(200).send({message:"Delete Selected Invoice Successfully",succes:true,deleted:`Total record Deleted ${datalength}`})
        }
    }  
    )
}
const updateInvoice =async(req,res)=>{
    let id =req.params.id
    id = id.replace(":",""); 
    let invoicemodel = new invoiceSchema(req.body)
    const userIds = req.body.item.map(user => user.invoice_itemId.replace("new ObjectId()",""));
    const quatitys=req.body.item.map(user => user.quantity);
    let Items=await invoiceItemSchema.find({_id: { $in: userIds}},{_id:0,__v: 0})
    for(let j=0;j<invoicemodel.item.length;j++){
        invoicemodel.item[j].invoice_data= invoicemodel.item[j].invoice_itemId
    }
    let totalAmount=0
    for(let i = 0;i < Items.length;i++){   
        totalAmount += Items[i].itemprice * quatitys[i]        
    }
    let updatedinvoice = {
        customerId:invoicemodel.customerId,
        custdata:invoicemodel.customerId,
        item:invoicemodel.item,
        invoicedate:invoicemodel.invoicedate,
        totalamount:totalAmount
    }

    // let invoicemodel = new invoiceSchema({
    //     customerId:req.body.customerId,
    //     item:req.body.item,
    //     invoicedate:req.body.invoicedate
    // });
    console.log(updatedinvoice,'update');
    invoiceSchema.findByIdAndUpdate({_id:id}, { $set: {                // <-- set stage
        customerId:invoicemodel.customerId,
        custdata:invoicemodel.customerId,
        item:invoicemodel.item,
        invoicedate:invoicemodel.invoicedate,
        totalamount:totalAmount
       } 
     },(err,obj)=>{
        if(err){
            res.status(400).send({message:"Can't Update Invoice",error:err.message})
        }
        else{
            console.log(obj,'obj');
            res.status(200).send({message:"Update Invoice Successfully",succes:true})
        }
    })
}
const getinvoicePdfbyNo = async (req,res)=>{
    let no = req.params.no;
    no= no.replace(":","");
    
    let data = await invoiceSchema.find({invoiceno:no}).populate([{path:'custdata'},{path:'item.invoice_data'}])
    invoiceSchema.findOne({invoiceno:no},async (err,obj)=>{
        if(err){
            return res.status(500).send({message:"Can't Find Invoice With Number",erroor:err.message})
        }
        else{
            customerid= data[0].customerId
            let Customer =await CustomerSchema.find({_id:customerid},{_id:0,__v:0})

            // let name = data.custdata;

            console.log(data,'data check',Customer);
            res.status(200).render("invoice",{name:Customer.name})
            
            // res.status(200).download(path.join('views/invoice.ejs'));
        }
    })
}
const getInvoice= (req,res)=>{
    invoiceSchema.find().populate([
      {
        path: 'custdata',
      },{
        path: 'item.invoice_data',
      }]).exec( function (err, obj) {
        if(err){
            return res.status(400).send({message:"Can't find Invoice",error:err.message})
        }
        else{
            return res.status(200).send({message:"Get Invoice Successfully",data:obj,succes:true})
        }
    })
   
}
const getInvoiceByNo = (req,res)=>{
    let no =req.params.no;
    no= no.replace(":","")
    invoiceSchema.find({invoiceno:no}).populate([{
        path: 'custdata',
      },{
        path: 'item.invoice_data'
      }]).exec((err,obj)=>{
        if(err){
            return res.status(400).send({message:"Can't find Invoice By Number",error:err.message})  
        }
        else{
            return res.status(200).send({message:"Get Invoice By Number",data:obj,succes:true})
        }
    })
}
 const deleteInvoice = (req,res)=>{
    let id =req.params.id
    id = id.replace(":","");
    invoiceSchema.findByIdAndDelete({_id:id},(err,obj)=>{
        if(err){
            res.status(400).send({message:"Can't Delete Invoice",error:err})
        }
        else{
            res.status(200).send({message:"Delete Invoice Successfully",succes:true})
        }
    })

 }

module.exports = {
    addInvoice,
    getInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoiceByNo,
    getinvoicePdfbyNo,
    deleteSelected
}