const CustomerSchema = require('../modelSchema/customer_model')
const getCustomer = (req, res) => {
    CustomerSchema.find((err, obj) => {
        if (err) {
            res.status(400).send({ message: "not found", error: err })
        }
        else {
            res.status(200).send({message: "Customer Get Successfully",data:obj,succes:true})
        }
    })
}
const updateCustomer = (req, res) => {
    let id = req.params.id;
    let updatedCustomers = req.body
    id = id.replace(":", "");
    console.log(id, typeof id);
    CustomerSchema.updateOne({ _id: id }, updatedCustomers, (err, obj) => {
        if (err) {
            res.status(400).send({ message: "Failed to update", error: err })
        }
        else {
            res.status(200).send({ message: "Update Succesfull ",succes:true })
        }
    })
}
const deleteCustomer = (req, res) => {
    let id = req.params.id;
    id = id.replace(":", "")
    CustomerSchema.deleteOne({ _id: id }, (err, obj) => {
        if (err) {
            res.status(400).send({ message: " Can't Delete Customer", error: err })
        }
        else {
            res.status(200).send({ message: "Delete Customer Succesfully",success:true })
        }
    })
}
const getCustomerById = (req, res) => {
    let id = req.params.id
    id = id.replace(":", "");
    CustomerSchema.find({ _id: id }, (err, obj) => {
        if (err) {
            res.status(400).send({ message: " Can't Get Customer By Id", error: err.message })
        }
        else {
            res.status(200).send({ message: "Customer Find with id", data:obj,succes:true })
        }
    })
}

const addCustomer = (req, res) => {
    let addCustomer = new CustomerSchema(req.body)
    CustomerSchema.create(addCustomer, (err, obj) => {
        if (err) {
            res.status(400).send({ message: "Error in Posting", error: err })
        }
        else {
            res.status(201).send({ message: "Added Customer Successfully",succes:true})
        }
    })
}

module.exports = {
    getCustomer,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById
}