const express = require('express');
const { getPaymentStatus, updatePaymentbyID, createOrder, updateBothbyorderId } = require('../controller/payment-controller');
const route = express.Router();
route.get('/invoice/payment/status:id',getPaymentStatus);
route.patch('/invoice/payment/update:id',updatePaymentbyID);
route.post('/invoice/payment/create',createOrder);
route.put('/invoice/payment/update/:order/status',updateBothbyorderId)

module.exports = route;