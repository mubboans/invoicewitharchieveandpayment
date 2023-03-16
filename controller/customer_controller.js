const CustomerSchema = require('../modelSchema/customer_model');
// var csv = require('csvtojson');
var csv = require('fast-csv');
const getCustomer = (req, res,next) => {
    CustomerSchema.find().sort({ _id: -1 }).exec((err, obj) => {
        if (err) {
            res.status(400).send({ message: "not found", error: err })
        }
        else {
            res.status(200).send({ message: "Customer Get Successfully", data: obj, succes: true })
        }
    })
}
const updateCustomer = (req, res,next) => {
    let id = req.params.id;
    let updatedCustomers = req.body
    id = id.replace(":", "");
    console.log(id, typeof id);
    CustomerSchema.updateOne({ _id: id }, updatedCustomers, (err, obj) => {
        if (err) {
            res.status(400).send({ message: "Failed to update", error: err })
        }
        else {
            res.status(200).send({ message: "Update Succesfull ", succes: true })
        }
    })
}
const deleteCustomer = (req, res,next) => {
    let id = req.params.id;
    id = id.replace(":", "")
    CustomerSchema.deleteOne({ _id: id }, (err, obj) => {
        if (err) {
            res.status(400).send({ message: " Can't Delete Customer", error: err })
        }
        else {
            res.status(200).send({ message: "Delete Customer Succesfully", success: true })
        }
    })
}
const getCustomerById = (req, res,next) => {
    let id = req.params.id
    id = id.replace(":", "");
    CustomerSchema.find({ _id: id }, (err, obj) => {
        if (err) {
            res.status(400).send({ message: " Can't Get Customer By Id", error: err.message })
        }
        else {
            res.status(200).send({ message: "Customer Find with id", data: obj, succes: true })
        }
    })
}

const addCustomer = (req, res,next) => {
    let addCustomer = new CustomerSchema(req.body)
    CustomerSchema.create(addCustomer, (err, obj) => {
        if (err) {
            res.status(400).send({ message: "Error in Posting", error: err })
        }
        else {
            res.status(201).send({ message: "Added Customer Successfully", succes: true })
        }
    })
}
const CustomerCSV = async (req, res,next) => {
   
    let data;
    let CustomerData;
    let CustomerArray = [];
    console.log(req.body, req.files);
    if (!req.files || !req.files.customercsv) {
        return res.status(400).send({ message: "Please Select a File", error: "Can't Find File In Request" })
    }
    //     csv()  
    // .fromFile(req.files.customercsv)  
    // .then((jsonObj)=>{ 
    //     console.log(jsonObj,'json check');
    // })

    var authorFile = req.files.customercsv;
    var customers = [];

    csv.parseString(authorFile.data.toString(), {
        headers: true,
        ignoreEmpty: true
    })
        .on("data", function (data) {
            //  data['_id'] = new mongoose.Types.ObjectId();

            customers.push(data);
        })
        .on("end", async function () {
            let datasave = 0;
            let datacancel = 0;
            console.log(customers.length,'length');
            for (let i = 0; i < customers.length; i++) {
                if (customers[i]) {
                    if(customers[i].name && customers[i].email && customers[i].contact && customers[i].line1){
                        // customers[i].contact= customers[i].contact.replace(" ","");
                        // customers[i].contact=customers[i].contact.replace(" ","");
                        console.log(customers[i].contact);
                        CustomerData = {
                            name: customers[i].name,
                            email: customers[i].email,
                            contact: customers[i].contact,
                            address: {
                                line1: customers[i].line1,
                                line2: customers[i].line2,
                                city: customers[i].city,
                                country: customers[i].country,
                                state: customers[i].state,
                                pincode: Number(customers[i].pincode)
                            }
                        }
                        console.log(CustomerData.contact,'contact');
                        // console.log(CustomerData,'data check');
                        data = await CustomerSchema.find({ contact: customers[i].contact });
                        console.log(data,'check data'); 
                        if (data.length > 0) {
                        datacancel++;
                            // return res.status(400).send({message:"Duplicate Record Found",error:true})
                        }
                        else {
        
                            CustomerArray.push(CustomerData);
                            datasave++;
                            console.log(CustomerArray);
                            // CustomerSchema.create(CustomerData,(err,obj)=>{
                            //         if(err){
                            //             console.log('error',err);
                            //             // return res.status(400).send({message:"Failed to saved Data",error:err.message})   
                            //         }
                            //         else{
                            //             console.log('data saved successfully');
                            //         }
                            // })
                        }
                    }
         
                    }

                   
                         }
            console.log(CustomerArray,'Custemer data',datasave,datacancel);
            if (CustomerArray.length > 0) {
                CustomerSchema.insertMany(CustomerArray, (err, obj) => {
                    if (err) {
                        return res.status(400).send({ message: 'Error in save', error: err.message });
                    }
                    else {
                        console.log(datasave, datacancel, 'save & cancel');
                        return res.status(200).send({ message: `Successfully Save ${CustomerArray.length} and Skip ${datacancel} Customer `, success: true, });
                    }
                })
            }
            else{
                return res.status(400).send({ message:"Can't Save Customer ", success:false});
            }
            // console.log(customers,'end');
           
        });
      
  
}

module.exports = {
    getCustomer,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById,
    CustomerCSV
}