const notFound = (req,res)=>{
    console.log('url',req.url);
    res.status(404).send({message:"Route Lookig for Does't Exists"})
}
module.exports = notFound;