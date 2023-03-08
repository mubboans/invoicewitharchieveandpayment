const express = require('express');
const { getInvoice, addInvoice, deleteInvoice, updateInvoice, getInvoiceByNo, getinvoicePdfbyNo, deleteSelected } = require('../controller/invoice_controller');

const route = express.Router();
route.post('/invoice',addInvoice);
route.put('/invoice:id',updateInvoice);
route.get('/invoice',getInvoice);
route.delete('/invoice:id',deleteInvoice);
route.get('/invoice:no',getInvoiceByNo);
route.get('/invoice/pdf:no',getinvoicePdfbyNo);
route.post('/invoice/delete',deleteSelected);



module.exports = route