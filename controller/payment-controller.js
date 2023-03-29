const payDetail = require('../modelSchema/payment_model');
const sdk = require('api')('@cashfreedocs-new/v3#he81m7ldwtny5h');
const serverurl = 'sandbox.cashfree.com';
const axios = require('axios');
const OrderCreate = require('../modelSchema/orderCreation_model')
// const fetch = require('node-fetch');
// var http = require('https');
// const updateAll =async(req,res)= {

// }
const getorderDetail = (req,res)=>{

}
const createOrder=async (req,res)=>{
    const configdata = {
        'x-client-id': process.env.CASHAPPID,
        'x-client-secret': process.env.CASHSECRETKEY,
        'x-api-version': '2022-09-01'
    }
    //     const creatingOrder = await fetch(serverurl, {
    // var options = {
    //     host : serverurl,
    //     path : '/pg/orders',
    //     method : 'POST',
    //     headers:configdata
    // }
    const options = {
        method: 'POST',
        url: 'https://sandbox.cashfree.com/pg/orders',
        headers:configdata,
        data: req.body
      }
    // console.log(options); 
    // var req = http.request(options, (res) => {
    //     console.log(`statusCode: ${res.statusCode}`);
      
    //     res.on('data', (d) => {
    //       console.log(d);
    //     });
    //   });
    //   req.on('error', (error) => {
    //     console.log(error);
    //   });
    axios(options)
    .then((response) => {
        let orderobj = new OrderCreate(response.data);
        orderobj.save(orderobj,(err,obj)=>{
            if(err){
                res.status(400).send({message:"Cant save order",success:false,error:err})
            }
            else{
                res.status(201).send({message:"Success Save Data",sucess:true,data:obj})
            }
        })
    })
    .catch((error) => {
        res.status(400).send({message:"Error In Creating Link",success:false,error:error})
    });
    // console.log('finish');
// 	method: 'post',
// 	body:req.body,
// 	headers: configdata
// });
// console.log(serverurl,configdata,req.body,creatingOrder);
// const obj = await creatingOrder.json();
// if(obj.ok){
//     res.status(201).send({message:"Success Save Data",sucess:true,data:obj})
// }
// else{
//     res.status(400).send({message:"Error to Save Data",success:false,error:obj.message})
// }

// console.log(obj);
    // const response = await fetch('https://github.com/');
    // const body = await response.text();
    
    // console.log(body);
}
const getPaymentStatus = async (req, res, next) => {
    let id = req.params.id;

    id = id.replace(":", "");
    const configdata = {
        link_id: id,
        'x-client-id': process.env.CASHAPPID,
        'x-client-secret': process.env.CASHSECRETKEY,
        'x-api-version': '2022-09-01'
    }

    sdk.server('https://sandbox.cashfree.com/pg');

    sdk.getPaymentLinkDetails(configdata)
        .then(({ data }) => res.status(200).send({ message: 'Successfully Fetch Status', success: true, data: data }))
        .catch(err => res.status(400).send({ message: 'Failed to Fetch Status', success: false, error: err }));
}

// const detailbyOrderId = (req, res) => {
//     let id = req.params.id;

//     id = id.replace(":", "");
//     const configdata = {
//         link_id: id,
//         'x-client-id': process.env.CASHAPPID,
//         'x-client-secret': process.env.CASHSECRETKEY,
//         'x-api-version': '2022-09-01'
//     }
//     sdk.server('https://sandbox.cashfree.com/pg');
//     sdk.getPaymentLinkOrders(configdata)
//         .then(({ data }) => res.status(200).send({ message: 'Successfully Fetch Detail Order', success: true, data: data }))
//         .catch(err => res.status(400).send({ message: 'Failed to Fetch Detail', success: false, error: err }));
// }

const cancelLink = (req,res)=>{
    
    let id = req.params.id;

    id = id.replace(":", "");
    const configdata = {
        link_id: id,
        'x-client-id': process.env.CASHAPPID,
        'x-client-secret': process.env.CASHSECRETKEY,
        'x-api-version': '2022-09-01'
    }
    sdk.server('https://sandbox.cashfree.com/pg');
    sdk.cancelPaymentLink(configdata)
        .then(({ data }) => res.status(200).send({ message: 'Successfully Cancel Link', success: true, data: data }))
        .catch(err => res.status(400).send({ message: 'Failed to Cancel Link', success: false, error: err }));
    
}

const updateBothbyorderId = (req, res) => {
    let order = req.params.order;
    let data = req.body;
    order = order.replace(":", "");
    
    const updatestatuspayment = {
        link_status: data.status,
        link_amount_paid:data.amount
    }
    const updatestatusorder = {
        order_status: data.status,
        order_amount_recieve:data.amount,
        transactionId:data.transactionId
    }
    console.log(order,updatestatuspayment,updatestatusorder,'id called');
    payDetail.findOneAndUpdate({ order_id: order }, updatestatuspayment, (err, obj) => {
        if (err) {
            console.log(err);
         return res.status(400).send({ message: "Can't Update Status in payment", success: false, error: err });
        }
        else {
            OrderCreate.findOneAndUpdate({ order_id: order }, updatestatusorder, (err, obj) => {
                if (err) {
                 return res.status(400).send({ message: "Can't Update Status in order", success: false, error: err });
                }
                else {
                    return  res.status(200).send({ message: "Successfull Update Status", success: true });
                }
            })
        }
    })


}
const updatePaymentbyID = (req, res) => {
    let id = req.params.id;
    let paymentDetails = new payDetail(req.body)
    id = id.replace(":", "");
    console.log(id, paymentDetails);
    let updateObj = {
        cf_link_id: paymentDetails.cf_link_id,
        link_id: paymentDetails.link_id,
        link_status: paymentDetails.link_status,
        link_currency: paymentDetails.link_currency,
        link_amount: paymentDetails.link_amount,
        link_partial_payments: paymentDetails.link_partial_payments,
        link_amount_paid: paymentDetails.link_amount_paid,
        link_minimum_partial_amount: paymentDetails.link_minimum_partial_amount,
        link_purpose: paymentDetails.link_purpose,
        link_created_at: paymentDetails.link_created_at,
        customer_details: {
            customer_name: paymentDetails.customer_details.customer_name,
            country_code: paymentDetails.customer_details.country_code,
            customer_phone: paymentDetails.customer_details.customer_phone,
            customer_email: paymentDetails.customer_details.customer_email
        },
        link_url: paymentDetails.link_url,
        link_expiry_time: paymentDetails.link_expiry_time,
        link_notify: { send_email: paymentDetails.link_notify.send_email, send_sms: paymentDetails.link_notify.send_email },

    }
    payDetail.findByIdAndUpdate({ _id: id }, updateObj, (err, obj) => {
        if (err) {
            res.status(400).send({ message: 'Failed to update', success: false, error: err })
        }
        else {
            res.status(200).send({ message: 'Successfully Update', success: true })
        }
    })
}
module.exports = {
    updatePaymentbyID, getPaymentStatus,createOrder,updateBothbyorderId
}