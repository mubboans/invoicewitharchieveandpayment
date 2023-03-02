const express = require('express');
const { getinvoiceitem, addinvoiceitem, upateInvoiceItem, deleteinvoiceItem } = require('../controller/invoice_item_controller');
const route = express.Router();
 
route.get('/invoice_item',getinvoiceitem);
route.post('/invoice_item',addinvoiceitem);
route.put('/invoice_item:id',upateInvoiceItem);
route.delete('/invoice_item:id',deleteinvoiceItem);

module.exports = route;
