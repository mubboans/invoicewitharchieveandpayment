const express = require('express');
const {getbulkPdf, getbulkPdfdir, addinvoiceArchiveFie, getInvoiceArchieList} = require('../controller/bulk-pdf')
const route = express.Router();

route.post('/invoice/bulk/pdf',getbulkPdf);
route.post('/invoice/bulkpdf/dir',getbulkPdfdir),
route.post('/invoice/bulkpdf/zip',addinvoiceArchiveFie);

route.get('/invoice/get/history/archieve',getInvoiceArchieList)
module.exports = route;