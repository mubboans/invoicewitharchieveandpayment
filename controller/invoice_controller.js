const invoiceSchema = require('../modelSchema/invoice_model')
const invoiceItemSchema = require('../modelSchema/invoice_item_model')
const addInvoice =async (req,res)=>{
    let invoicemodel = new invoiceSchema(req.body);
    var d = new Date().toISOString().slice(0, 10).toString(); 
    d= d.replace("-","")
    d= d.replace("-","")
    var randomnum = Math.floor(Math.random() * (1000 -  100)) + 1000;
    invoicemodel.invoiceno = randomnum + d;
    const userIds = req.body.item.map(user => user.invoice_itemId.replace("new ObjectId()",""));
    const quatitys=req.body.item.map(user => user.quatity);

    let Items=await invoiceItemSchema.find({_id: { $in: userIds}},{_id:0,__v: 0})
    let today = new Date()
    today.toISOString().split('T')[0]
    invoicemodel.invoicedate=today;
    let totalAmount=0
    for(let i = 0;i < Items.length;i++){   
        totalAmount += Items[i].itemprice * quatitys[i]        
    }
    invoicemodel.totalamount = totalAmount;
    console.log(userIds,'ids are',Items,quatitys,totalAmount);
    invoiceSchema.create(invoicemodel,(err,obj)=>{
        if(err){
            res.status(401).send({message:"Can't Post Invoice",error:err})
        }
        else{
            res.status(200).send({message:"Added Invoice Succesfull",succes:true})
        }
    })
} 

const updateInvoice = (req,res)=>{
    let id =req.params.id
    id = id.replace(":",""); 
    let invoice = req.body;
    invoiceSchema.findByIdAndUpdate({_id:id},invoice,(err,obj)=>{
        if(err){
            res.status(401).send({message:"Can't Update Invoice",error:err})
        }
        else{
            res.status(200).send({message:"Update Invoice Successfully",succes:true})
        }
    })
}
const getInvoice= (req,res)=>{
    invoiceSchema.find().populate([{
        path: 'customerId',select:'name email contact address'
      },{
        path: 'item.invoice_itemId',
      }]).exec( function (err, obj) {
        if(err){
            return res.status(401).send({message:"Can't find Invoice",error:err.message})
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
        path: 'customerId',select:'name email contact address'
      },{
        path: 'item.invoice_itemId',
      }]).exec((err,obj)=>{
        if(err){
            return res.status(401).send({message:"Can't find Invoice By Number",error:err.message})  
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
            res.status(401).send({message:"Can't Delete Invoice",error:err})
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
    getInvoiceByNo
}