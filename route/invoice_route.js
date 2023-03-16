const express = require('express');
const { getInvoice, addInvoice, deleteInvoice, updateInvoice, getInvoiceByNo, getinvoicePdfbyNo, deleteSelected, readablePDF, getPaymentStatus } = require('../controller/invoice_controller');

const route = express.Router();
route.post('/invoice',addInvoice);
route.put('/invoice:id',updateInvoice);
route.get('/invoice',getInvoice);
route.delete('/invoice:id',deleteInvoice);
route.get('/invoices:no',getInvoiceByNo);
route.get('/invoice/pdf:no',getinvoicePdfbyNo);
route.post('/invoice/delete',deleteSelected);
route.get('/invoice/:no/pdf',readablePDF);
route.get('/invoice/payment/status:id',getPaymentStatus)

module.exports = route