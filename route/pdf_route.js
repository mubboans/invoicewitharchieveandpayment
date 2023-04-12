const express = require('express');
const {getbulkPdf, getbulkPdfdir, addinvoiceArchiveFie, getInvoiceArchieList, deleteInvoiceArchieve, uploadFileAws} = require('../controller/bulk-pdf')
const route = express.Router();

route.post('/invoice/bulk/pdf',getbulkPdf);
route.post('/invoice/bulkpdf/dir',getbulkPdfdir),
route.post('/invoice/bulkpdf/zip',addinvoiceArchiveFie);

route.get('/invoice/get/history/archieve',getInvoiceArchieList);
route.delete('/invoice/history/archieve:ids',deleteInvoiceArchieve)

route.post('/test/upload',uploadFileAws);
module.exports = route;