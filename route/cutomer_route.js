const express = require('express');
const { getCustomer, addCustomer, updateCustomer, deleteCustomer, getCustomerById, CustomerCSV } = require('../controller/customer_controller');
const route = express.Router();
const Cutomer = require('../modelSchema/customer_model')
route.get('/customer',getCustomer);
route.post('/customer',addCustomer)
route.route('/customer:id').get(getCustomerById).put(updateCustomer).delete(deleteCustomer)
route.post('/customer/multiupload',CustomerCSV)
// route.put('/customer:id', updateCustomer)
// route.delete('/customer:id', deleteCustomer)
// route.get('/customer:id',getCustomerById)
module.exports = route;

