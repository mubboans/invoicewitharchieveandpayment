const invoiceSchema = require('../modelSchema/invoice_model');
const invoiceItemSchema = require('../modelSchema/invoice_item_model');
const CustomerSchema = require('../modelSchema/customer_model');
const ejs = require('ejs');
const invoiceArchive = require('../modelSchema/invoiceArchivewithPath');
const AdmZip = require('adm-zip');
const payDetail = require('../modelSchema/payment_model');
const puppeteer = require('puppeteer');
const asyncWrapper = require('../middleware/asynwrapper')
const fs = require("fs");
const moment = require('moment');
const path = require('path');
const { URL } = require('whatwg-url');
const getbulkPdf = asyncWrapper(async (req, res) => {
    let pdfPaths = [];
    let ids = req.body.ids;
    const zip = new AdmZip();
    for (let i = 0; i < ids.length; i++) {
        let data = await invoiceSchema.find({ invoiceno: ids[i] }).populate([{ path: 'custdata' }, { path: 'item.invoice_data' }, { path: 'order_Create' }])
        console.log(data, 'invoice');
        if (data.length === 0) {
            res.status(404).send({ message: "Can't Find Invoice With Number", error: "failed" })
            break;
        }
    }

    for (let i = 0; i < ids.length; i++) {
        await puppeteer.createBrowserFetcher().download(puppeteer.PUPPETEER_REVISIONS.chromium);
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        let data = await invoiceSchema.find({ invoiceno: ids[i] }).populate([{ path: 'custdata' }, { path: 'item.invoice_data' }, { path: 'order_Create' }])
        invoiceSchema.find({ invoiceno: ids[i] }, async (err, obj) => {
            if (err) {
                console.log('err', err);

                return res.status(404).send({ message: "Can't Find Invoice With Number", error: err.message })

            }
            else {
                if (obj == null) {
                    console.log('null',);
                    const d = new CustomError("Can't Find Data With Number", 404);
                    return res.status(d.statusCode).send({ message: d.message, success: false })

                }

                customerid = data[0].customerId
                let Customer = await CustomerSchema.find({ _id: customerid }, { _id: 0, __v: 0 })

                const detailed = {
                    name: Customer[0].name,
                    email: Customer[0].email,
                    contact: Customer[0].contact,
                    address: Customer[0].address,
                    items: data[0].item,
                    inno: data[0].invoiceno,
                    amount: data[0].totalamount,
                    indate: data[0].invoicedate,
                    itemlength: data[0].item.length,
                    createddate: data[0].createdOn,
                    id: data[0]._id,
                }

                const html = await ejs.renderFile('./views/read-invoice.ejs', { detail: detailed, allitem: data[0].item, invoiceno: data[0].invoiceno });
                await puppeteer.createBrowserFetcher().download(puppeteer.PUPPETEER_REVISIONS.chromium)
                const browser = await puppeteer.launch(); // launch puppeteer
                const page = await browser.newPage(); // create a new page
                await page.setContent(html); // set the html content to your page
                const pdfBuffer = await page.pdf(); // generate a pdf buffer from your page

                const fileName = `${data[0].invoiceno}.pdf`;
                console.log(fileName);
                zip.addFile(fileName, pdfBuffer);
                console.log('last');
                const entries = zip.getEntries();
                if (entries && entries.length == ids.length) {
                    const zipBuffer = zip.toBuffer();

                    res.set('Content-Type', 'application/zip');
                    res.set('Content-Disposition', 'attachment; filename=bulkpdf.zip');
                    res.set('Content-Length', zipBuffer.length);

                    res.send(zipBuffer);
                    //     console.log('last');
                    //     console.log(zipBuffer.length,zip);

                    //  res.status(200).send(zipBuffer);
                }
                // else if(entries && entries.length  != ids.length){
                //   return res.status(400).send({message:"Can't generate zip",success:false,status:'failed'}); 
                // }
                await browser.close();
            }
        })

        // else{
        //     res.status(400).send({message: "Cant't Generate zip for invoice",success:false});  
        // }
        pdfPaths.push(...data)
        console.log('first');
    }
})
function fileResponse(zipped, length, res, extra, start, end) {
    const parentDir = path.join(__dirname, '../');
    const zippPath = path.join(parentDir, 'zipped');

    let entry = zipped.getEntries()
    // console.log(called);
    if (entry && entry.length == length) {
        console.log(entry.length, extra);
        console.log(end.getMinutes() - start.getMinutes(), 'time');
        // console.log('file reading working', entry)
        const zipBuffer = zipped.toBuffer();

        res.set('Content-Type', 'application/zip');
        res.set('Content-Disposition', 'attachment; filename=bulkpdf.zip');
        res.set('Content-Length', zipBuffer.length);
        res.status(200).send(zipBuffer)
        res.end();
    }
}

function createZip(zipped, data, req, res) {
    let entry = zipped.getEntries();
    let { zipPath, length, starttime, fileId, fileNamed } = data
    console.log('Create zipp',length,entry.length,zipPath);
    
    let ZipfileName = `invoice_${fileId}.zip`;
    if (entry && entry.length == length) {
        console.log('entry match');
        if (!fs.existsSync(zipPath)) {
            fs.mkdirSync(zipPath)
        }
        const ZipfilePath = path.join(zipPath, ZipfileName);

        zipped.writeZip(ZipfilePath, function (err) {
            if (err) {
                console.log(err);
            } else {
                let endTimed = new Date();
                let invoiceZipArchiever = new invoiceArchive({})
                let totaltime = endTimed.getMinutes() - starttime;
                invoiceZipArchiever.filename = ZipfileName
                invoiceZipArchiever.filelength = length;
                invoiceZipArchiever.status = 'Completed';
                invoiceZipArchiever.filedate = moment(endTimed).format('MM/DD/YYYY');
                invoiceZipArchiever.startTime =moment(starttime).format('HH:mm');
                invoiceZipArchiever.endTime =moment(new Date()).format('HH:mm');
                invoiceZipArchiever.timeTaken = totaltime + 'ms';
                invoiceZipArchiever.filePath = new URL(`file:///${ZipfilePath}`).href;
                let updateField={
                    filename:ZipfileName,filelength:length,status:'Completed',
                    filedate:moment(endTimed).format('MM/DD/YYYY'),startTime:starttime,endTime:endTimed.getMinutes(),
                    timeTaken:totaltime + 'ms',filePath:new URL(`file:///${ZipfilePath}`).href
                } 
                invoiceArchive.findByIdAndUpdate({_id:fileId},updateField,(err,obj)=>{
                    if (err) {
                        // res.setHeader('Content-Type', 'application/json');
                        res.status(400).write(JSON.stringify({ message: "Can't Update invoice History", success: false, error: err.message }));
                        res.end();
                    }
                    else {
                        console.log('updated archieve file');
                       
                        res.status(201).write(JSON.stringify({ message: "Update Save", success: true, status: 'Success',data:obj}));
                        res.end();
                    } 
                })
                
                console.log('saving file');
             

           
                // invoiceArchive.create(invoiceZipArchiever, (err, obj) => {
                //     if (err) {
                //         res.status(400).send({ message: "Can't Save invoice History", success: false, error: err.message });
                //     }
                //     else {
                //         res.status(201).send({ message: "Success Save", success: true, status: 'Success',data:obj});
                //     }
                // })
            }
        });
    }


}
async function checkFile(dirpath, ids, res) {
    const zipp = new AdmZip();
    let entry = zipp.getEntries();
    const startTime = new Date();
    for (let i = 0; i < ids.length; i++) {

        // console.log("LN:116 reached here in for loop block")
        let filePath = `${dirpath}/${ids[i]}.pdf`;
        fs.access(filePath, fs.constants.F_OK, async (err) => {
            if (!err) {
                filedata = fs.readdirSync(dirpath).filter(async (file, index) => {

                    if (file.endsWith('.pdf') && ids.includes(parseInt(file.slice(0, -3)))) {
                        // console.log('if');
                        return file;
                    }
                })
                const filename = filedata.filter(x => x == `${ids[i].toString()}.pdf`)
                console.log('file data', filename[0]);
                const filePath = path.join(dirpath, filename[0]);
                zipp.addLocalFile(filePath);
                // filedata.forEach((file,index) => {
                //     // console.log(file, 'file name test');
                //     const filePath = path.join(dirpath, file);

                //     // console.log(filePath, 'file path');
                //     if(index == i){

                //         zipp.addLocalFile(filePath);
                //     }
                // })    
                let endTimeif = new Date();
                let entry = zipp.getEntries()
                if (entry && entry.length == ids.length) {

                    return fileResponse(zipp, ids.length, res, 'if', startTime, endTimeif);
                }

            }
            else {
                await puppeteer.createBrowserFetcher().download(puppeteer.PUPPETEER_REVISIONS.chromium)
                const browser = await puppeteer.launch();
                const page = await browser.newPage();
                let data = await invoiceSchema.find({ invoiceno: ids[i] }).populate([{ path: 'custdata' }, { path: 'item.invoice_data' }, { path: 'order_Create' }])
                invoiceSchema.find({ invoiceno: ids[i] }, async (err, obj) => {
                    if (err) {
                        console.log('err', err);
                        // return res.status(404).send({ message: "Can't Find Invoice With Number", error: err.message })

                    }
                    else {
                        await puppeteer.createBrowserFetcher().download(puppeteer.PUPPETEER_REVISIONS.chromium)
                        const browser = await puppeteer.launch();
                        const page = await browser.newPage();
                        let data = await invoiceSchema.find({ invoiceno: ids[i] }).populate([{ path: 'custdata' }, { path: 'item.invoice_data' }, { path: 'order_Create' }])
                        invoiceSchema.find({ invoiceno: ids[i] }, async (err, obj) => {
                            if (err) {
                                // return res.status(404).send({ message: "Can't Find Invoice With Number", error: err.message })
                            }
                            else {
                                customerid = data[0].customerId
                                let Customer = await CustomerSchema.find({ _id: customerid }, { _id: 0, __v: 0 })

                                const detailed = {
                                    name: Customer[0].name,
                                    email: Customer[0].email,
                                    contact: Customer[0].contact,
                                    address: Customer[0].address,
                                    items: data[0].item,
                                    inno: data[0].invoiceno,
                                    amount: data[0].totalamount,
                                    indate: data[0].invoicedate,
                                    itemlength: data[0].item.length,
                                    createddate: data[0].createdOn,
                                    id: data[0]._id,
                                }
                                // console.log(obj, 'response check');
                                const html = await ejs.renderFile('./views/read-invoice.ejs', { detail: detailed, allitem: data[0].item, invoiceno: data[0].invoiceno });
                                await puppeteer.createBrowserFetcher().download(puppeteer.PUPPETEER_REVISIONS.chromium)
                                const browser = await puppeteer.launch(); // launch puppeteer
                                const page = await browser.newPage(); // create a new page
                                await page.setContent(html); // set the html content to your page
                                const pdfBuffer = await page.pdf({
                                    format: 'A4',
                                    printBackground: true
                                }); // generate a pdf buffer from your page
                                const filename = `${obj[0].invoiceno}.pdf`;

                                // Create a directory for the PDF file

                                const parentDir = path.join(__dirname, '../');
                                const dirPath = path.join(parentDir, 'pdfs');
                                if (!fs.existsSync(dirPath)) {
                                    fs.mkdirSync(dirPath);
                                }
                                const filePath = path.join(dirpath, filename);

                                // Write the PDF file to the directory

                                fs.writeFileSync(filePath, pdfBuffer);


                                console.log(filePath, 'file added', i);
                                zipp.addLocalFile(filePath);


                                //    const entry = zipp.getEntries();

                                //    if(entry && entry.length == ids.length){
                                //    console.log('called entry');
                                let endTimeelse = new Date();
                                fileResponse(zipp, ids.length, res, 'else', startTime, endTimeelse)
                                //    }
                                await browser.close();

                            }


                        });
                    }
                }
                );

            }
        });
    }
}
const addinvoiceArchiveFie = (req, res) => {
    const zipp = new AdmZip();
    let ids = req.body.ids;
    const parentDir = path.join(__dirname, '../');
    const zippPath = path.join(parentDir, 'zipped');
    const pdfPath = path.join(parentDir, 'pdfs');
    let filedata;
    var d = new Date();
    var fileID="";
    d = moment(d).format('MM/DD/YYYY');
    let fileName = `invoice_${ids.length}_${d}.zip`
    let dataa = {
        zipPath: zippPath,
        length: ids.length,
        starttime: new Date().getMinutes(),
        fileNamed: fileName
    }
    // console.log(ids.length,'length',dataa.zipPath);
    if (ids.length > 0) {
        let invoiceZipArchiever = new invoiceArchive({})
        let totaltime = new Date().getMinutes() - new Date().getMinutes();
        invoiceZipArchiever.filename = fileName
        invoiceZipArchiever.filelength =ids.length;
        invoiceZipArchiever.status = 'Pending';
        invoiceZipArchiever.filedate = moment(new Date()).format('MM/DD/YYYY');
        invoiceZipArchiever.startTime =moment(new Date()).format('HH:mm'),
        invoiceZipArchiever.endTime = moment(new Date()).format('HH:mm'),
        invoiceZipArchiever.timeTaken =moment(new Date()).format('HH:mm'),
        invoiceZipArchiever.filePath = zippPath;
        invoiceArchive.create(invoiceZipArchiever, (err, obj) => {
            if (err) {
                res.setHeader('Content-Type', 'application/json');
                res.status(400).write(JSON.stringify({ message: "Can't Save invoice History", success: false, error: err.message }));
                res.end();
            }
            else {
                fileID = obj._id.toString();
                fileID = fileID.replace("new ObjectId()", "");
                // console.log(fileID,obj),
                res.setHeader('Content-Type', 'application/json');
                res.status(201).write(JSON.stringify({ message: "Success Save", success: true, status: 'Success',data:obj}));
                for (let i = 0; i < ids.length; i++) {
                    fs.access(pdfPath, fs.constants.F_OK, async (err) => {
                        if (!err && err !== null) {
                            console.log(err);
                            filedata = fs.readdirSync(pdfPath).filter(async (file) => {
                                // console.log(file);
                                if (file.endsWith('.pdf') && ids.includes(parseInt(file.slice(0, -3)))) {
                                    // console.log('if');
                                    return file;
                                }
                            })

                            const filename = filedata.filter(x => x == `${ids[i].toString()}.pdf`)
                            console.log('file data',pdfPath,filedata);
                            const filePath = path.join(pdfPath, filename[0]);
                            zipp.addLocalFile(filePath);
                            let endtime = new Date().getMinutes();
                            dataa['endtime'] = endtime;
                            dataa['fileId'] = fileID 
                            createZip(zipp, dataa, req, res)
                            // fileResponse(zipp,ids.length,res,'if')    
                        }
                        // else if(err ==null) {
                        //     const browser = await puppeteer.launch();
                        //     const page = await browser.newPage();
                        //     let data = await invoiceSchema.find({ invoiceno: ids[i] }).populate([{ path: 'custdata' }, { path: 'item.invoice_data' }, { path: 'order_Create' }])
                        //     invoiceSchema.find({ invoiceno: ids[i] }, async (err, obj) => {
                        //         if (err) {
                        //             console.log('err', err);
                        //             // return res.status(404).send({ message: "Can't Find Invoice With Number", error: err.message })
        
                        //         }
                        //         else {
                        //             const browser = await puppeteer.launch();
                        //             const page = await browser.newPage();
                        //             let data = await invoiceSchema.find({ invoiceno: ids[i] }).populate([{ path: 'custdata' }, { path: 'item.invoice_data' }, { path: 'order_Create' }])
                        //             invoiceSchema.find({ invoiceno: ids[i] }, async (err, obj) => {
                        //                 if (!err) {
                        //                     // return res.status(404).send({ message: "Can't Find Invoice With Number", error: err.message })                                customerid = data[0].customerId
                        //                     let Customer = await CustomerSchema.find({ _id: customerid }, { _id: 0, __v: 0 })
        
                        //                     const detailed = {
                        //                         name: Customer[0].name,
                        //                         email: Customer[0].email,
                        //                         contact: Customer[0].contact,
                        //                         address: Customer[0].address,
                        //                         items: data[0].item,
                        //                         inno: data[0].invoiceno,
                        //                         amount: data[0].totalamount,
                        //                         indate: data[0].invoicedate,
                        //                         itemlength: data[0].item.length,
                        //                         createddate: data[0].createdOn,
                        //                         id: data[0]._id,
                        //                     }
                        //                     const html = await ejs.renderFile('./views/read-invoice.ejs', { detail: detailed, allitem: data[0].item, invoiceno: data[0].invoiceno });
        
                        //                     const browser = await puppeteer.launch(); // launch puppeteer
                        //                     const page = await browser.newPage(); // create a new page
                        //                     await page.setContent(html); // set the html content to your page
                        //                     const pdfBuffer = await page.pdf({
                        //                         format: 'A4',
                        //                         printBackground: true
                        //                     }); // generate a pdf buffer from your page
                        //                     const filename = `${obj[0].invoiceno}.pdf`;
        
                        //                     // Create a directory for the PDF file
        
                        //                     const parentDir = path.join(__dirname, '../');
                        //                     const dirPath = path.join(parentDir, 'pdfs');
                        //                     if (!fs.existsSync(dirPath)) {
                        //                         fs.mkdirSync(dirPath);
                        //                     }
                        //                     const filePath = path.join(dirpath, filename);
        
                        //                     fs.writeFileSync(filePath, pdfBuffer);
        
                        //                     zipp.addLocalFile(filePath);
        
                        //                     let endtime = new Date().getMinutes();
                        //                     data['endtime'] = endtime;
                        //                     data['fileId'] = fileID;
                        //                     createZip(zipp, data, req, res)
                        //                     //    }
                        //                     await browser.close();
                        //                 }
                        //             });
                        //         }
                        //     }
                        //     );
                        // }
                         else {
                            let data = await invoiceSchema.find({ invoiceno: ids[i] }).populate([{ path: 'custdata' }, { path: 'item.invoice_data' }, { path: 'order_Create' }])
                            invoiceSchema.find({ invoiceno: ids[i] }, async (err, obj) => {
                                if (err) {
                                    console.log('err', err);
                                    // return res.status(404).send({ message: "Can't Find Invoice With Number", error: err.message })
        
                                }
                                else {
                                                             
                                            // return res.status(404).send({ message: "Can't Find Invoice With Number", error: err.message })                                customerid = data[0].customerId
                                            let Customer = await CustomerSchema.find({ _id: data[0].customerId }, { _id: 0, __v: 0 })
        
                                            const detailed = {
                                                name: Customer[0].name,
                                                email: Customer[0].email,
                                                contact: Customer[0].contact,
                                                address: Customer[0].address,
                                                items: data[0].item,
                                                inno: data[0].invoiceno,
                                                amount: data[0].totalamount,
                                                indate: data[0].invoicedate,
                                                itemlength: data[0].item.length,
                                                createddate: data[0].createdOn,
                                                id: data[0]._id,
                                            }
                                            const html = await ejs.renderFile('./views/read-invoice.ejs', { detail: detailed, allitem: data[0].item, invoiceno: data[0].invoiceno });
                                            await puppeteer.createBrowserFetcher().download(puppeteer.PUPPETEER_REVISIONS.chromium)
                                            const browser = await puppeteer.launch(); // launch puppeteer
                                            const page = await browser.newPage(); // create a new page
                                            await page.setContent(html); // set the html content to your page
                                            const pdfBuffer = await page.pdf({
                                                format: 'A4',
                                                printBackground: true
                                            }); // generate a pdf buffer from your page
                                            const filename = `${obj[0].invoiceno}.pdf`;
        
                                            // Create a directory for the PDF file
        
                                            const parentDir = path.join(__dirname, '../');
                                            const dirPath = path.join(parentDir, 'pdfs');
                                            if (!fs.existsSync(dirPath)) {
                                                fs.mkdirSync(dirPath);
                                            }
                                            const filePath = path.join(dirPath, filename);
        
                                            fs.writeFileSync(filePath, pdfBuffer);
        
                                            zipp.addLocalFile(filePath);
        
                                            let endtime = new Date().getMinutes();
                                            dataa['endtime'] = endtime;
                                            dataa['fileId'] = fileID;

                                            createZip(zipp, dataa, req, res)
                                            //    }
                                            await browser.close();
                                        }
                                    });
                                }
                            
                           
                        
                    });
                }
            }
        })

       
    }
    else {
        res.status(404).send({ message: "Can't find bulk invoice number", success: false });
    }

}
const getbulkPdfdir = async (req, res) => {
    const zipp = new AdmZip();
    console.log(req.body.ids);
    let ids = req.body.ids;
    const parentDir = path.join(__dirname, '../');
    const dirPath = path.join(parentDir, 'pdfs');
    if (ids.length > 0) {

        checkFile(dirPath, ids, res);
        // for (let i = 0; i < ids.length; i++) {
        //     console.log("LN:116 reached here in for loop block")
        //     let filePath = `${dirPath}/${ids[i]}.pdf`;
        //    fs.access(filePath, fs.constants.F_OK, async (err) => {
        //         if (!err) {
        //             return console.log('File Exists');
        //         }
        //         else {
        //             console.log('making file');
        //             const browser = await puppeteer.launch();
        //             const page = await browser.newPage();
        //             let data = await invoiceSchema.find({ invoiceno: ids[i] }).populate([{ path: 'custdata' }, { path: 'item.invoice_data' }, { path: 'order_Create' }])
        //             invoiceSchema.find({ invoiceno: ids[i] }, async (err, obj) => {
        //                 if (err) {
        //                     console.log('err', err);

        //                     return res.status(404).send({ message: "Can't Find Invoice With Number", error: err.message })

        //                 }
        //                 else {
        //                     customerid = data[0].customerId
        //                     let Customer = await CustomerSchema.find({ _id: customerid }, { _id: 0, __v: 0 })

        //                     const detailed = {
        //                         name: Customer[0].name,
        //                         email: Customer[0].email,
        //                         contact: Customer[0].contact,
        //                         address: Customer[0].address,
        //                         items: data[0].item,
        //                         inno: data[0].invoiceno,
        //                         amount: data[0].totalamount,
        //                         indate: data[0].invoicedate,
        //                         itemlength: data[0].item.length,
        //                         createddate: data[0].createdOn,
        //                         id: data[0]._id,
        //                     }
        //                     console.log(obj, 'response check');
        //                     const html = await ejs.renderFile('./views/read-invoice.ejs', { detail: detailed, allitem: data[0].item, invoiceno: data[0].invoiceno });

        //                     const browser = await puppeteer.launch(); // launch puppeteer
        //                     const page = await browser.newPage(); // create a new page
        //                     await page.setContent(html); // set the html content to your page
        //                     const pdfBuffer = await page.pdf({
        //                         format: 'A4',
        //                         printBackground: true
        //                     }); // generate a pdf buffer from your page
        //                     const filename = `${obj[0].invoiceno}.pdf`;

        //                     // Create a directory for the PDF file
        //                     const parentDir = path.join(__dirname, '../');
        //                     const dirPath = path.join(parentDir, 'pdfs');
        //                     if (!fs.existsSync(dirPath)) {
        //                         fs.mkdirSync(dirPath);
        //                     }
        //                     const filePath = path.join(dirPath, filename);

        //                     // Write the PDF file to the directory

        //                     fs.writeFileSync(filePath, pdfBuffer);
        //                     await browser.close();
        //                     console.log('Succes Write File', filename);

        //                 }
        //             }
        //             );

        //         }
        //     });
        // }
        // filedata =fs.readdirSync(dirPath).filter(async (file, index) => {
        //     console.log(file);
        //     if (file.endsWith('.pdf') && ids.includes(parseInt(file.slice(0, -3)))) {
        //         // console.log('if');
        //         return file;
        //     }
        // })
        // filedata.forEach((file) => {
        //     console.log(file, 'file name test');
        //     const filePath = path.join(dirPath, file);

        //     console.log(filePath, 'file path');
        //     zipp.addLocalFile(filePath);
        //     const entry = zipp.getEntries();

        //     if (entry && entry.length == ids.length) {
        //         console.log('file reading working', entry)
        //         const zipBuffer = zipp.toBuffer();

        //         res.set('Content-Type', 'application/zip');
        //         res.set('Content-Disposition', 'attachment; filename=bulkpdf.zip');
        //         res.set('Content-Length', zipBuffer.length);
        //         res.status(200).send(zipBuffer)
        //     }

        // })

    }
    else {
        res.status(404).send({ message: "Can't find bulk invoice number", success: false });
    }
    //         filedata = fs.readdirSync(dirPath).filter(async(file) => {

    //             return file.endsWith('.pdf') 
    // })
    // console.log(filedata);
    // if(filedata.length == 0){
    //     for (let i = 0; i < ids.length; i++) {
    //         console.log('else');
    //         const browser = await puppeteer.launch();
    //         const page = await browser.newPage();
    //         let data = await invoiceSchema.find({ invoiceno: ids[i] }).populate([{ path: 'custdata' }, { path: 'item.invoice_data' },{path: 'order_Create'}])
    //         invoiceSchema.find({ invoiceno: ids[i] }, async (err, obj) => {
    //             if (err) {
    //                 console.log('err',err);

    //                return res.status(404).send({ message: "Can't Find Invoice With Number", error: err.message })

    //             }
    //             else {
    //                 customerid = data[0].customerId
    //                 let Customer = await CustomerSchema.find({ _id: customerid }, { _id: 0, __v: 0 })

    //                 const detailed = {
    //                     name: Customer[0].name,
    //                     email: Customer[0].email,
    //                     contact: Customer[0].contact,
    //                     address: Customer[0].address,
    //                     items: data[0].item,
    //                     inno: data[0].invoiceno,
    //                     amount: data[0].totalamount,
    //                     indate: data[0].invoicedate,
    //                     itemlength: data[0].item.length,
    //                     createddate: data[0].createdOn,
    //                     id: data[0]._id,
    //                 }

    //                 const html = await ejs.renderFile('./views/read-invoice.ejs', { detail: detailed, allitem: data[0].item, invoiceno: data[0].invoiceno });

    //                 const browser = await puppeteer.launch(); // launch puppeteer
    //                 const page = await browser.newPage(); // create a new page
    //                 await page.setContent(html); // set the html content to your page
    //                 const pdfBuffer = await page.pdf({
    //                     format: 'A4',
    //                     printBackground: true
    //                   }); // generate a pdf buffer from your page
    //                   const filename = `${obj.invoiceno}.pdf`;

    //                   // Create a directory for the PDF file
    //                   const parentDir = path.join(__dirname, '../');
    //                   const dirPath = path.join(parentDir, 'pdfs');
    //                   if (!fs.existsSync(dirPath)) {
    //                     fs.mkdirSync(dirPath);
    //                   }
    //                   const filePath = path.join(dirPath, filename);

    //               // Write the PDF file to the directory
    //               fs.writeFileSync(filePath, pdfBuffer);
    //                 await browser.close();


    //   }
    // })
    //   }

    // }
    // else{
    //     filedata = fs.readdirSync(dirPath).filter(async(file,index) => {
    //         console.log(file);
    //       if(file.endsWith('.pdf') && ids.includes(parseInt(file.slice(0,-3)))) {
    //         console.log('if');
    //         return file;
    //       }
    //       else{
    //         for (let i = 0; i < ids.length; i++) {
    //             console.log('else');
    //             const browser = await puppeteer.launch();
    //             const page = await browser.newPage();
    //             let data = await invoiceSchema.find({ invoiceno: ids[i] }).populate([{ path: 'custdata' }, { path: 'item.invoice_data' },{path: 'order_Create'}])
    //             invoiceSchema.find({ invoiceno: ids[i] }, async (err, obj) => {
    //                 if (err) {
    //                     console.log('err',err);

    //                    return res.status(404).send({ message: "Can't Find Invoice With Number", error: err.message })

    //                 }
    //                 else {
    //                     customerid = data[0].customerId
    //                     let Customer = await CustomerSchema.find({ _id: customerid }, { _id: 0, __v: 0 })

    //                     const detailed = {
    //                         name: Customer[0].name,
    //                         email: Customer[0].email,
    //                         contact: Customer[0].contact,
    //                         address: Customer[0].address,
    //                         items: data[0].item,
    //                         inno: data[0].invoiceno,
    //                         amount: data[0].totalamount,
    //                         indate: data[0].invoicedate,
    //                         itemlength: data[0].item.length,
    //                         createddate: data[0].createdOn,
    //                         id: data[0]._id,
    //                     }

    //                     const html = await ejs.renderFile('./views/read-invoice.ejs', { detail: detailed, allitem: data[0].item, invoiceno: data[0].invoiceno });

    //                     const browser = await puppeteer.launch(); // launch puppeteer
    //                     const page = await browser.newPage(); // create a new page
    //                     await page.setContent(html); // set the html content to your page
    //                     const pdfBuffer = await page.pdf({
    //                         format: 'A4',
    //                         printBackground: true
    //                       }); // generate a pdf buffer from your page
    //                       const filename = `${obj.invoiceno}.pdf`;

    //                       // Create a directory for the PDF file
    //                       const parentDir = path.join(__dirname, '../');
    //                       const dirPath = path.join(parentDir, 'pdfs');
    //                       if (!fs.existsSync(dirPath)) {
    //                         fs.mkdirSync(dirPath);
    //                       }
    //                       const filePath = path.join(dirPath, filename);

    //                   // Write the PDF file to the directory
    //                   fs.writeFileSync(filePath, pdfBuffer);
    //                     await browser.close();


    //       }
    //     })
    //       };



    // }
    // })
    // }

}
const getInvoiceArchieList=(req,res)=>{
    invoiceArchive.find().sort({_id:-1}).exec((err,obj)=>{
        if(err){
            res.status(500).send({message:"Can't find any history",error:err.message,succes:false})
        }
        else{
            res.status(200).send({message:"Success get data",data:obj,success:true,status:'Success'});
        }
    })
}
const updateInvoiceArchieve =(req,res)=>{
    let id = req.params.ids;
    id = id.replace("new ObjectId()", "");
    invoiceArchive
}
module.exports = { getbulkPdf, getbulkPdfdir,addinvoiceArchiveFie,getInvoiceArchieList,updateInvoiceArchieve } 