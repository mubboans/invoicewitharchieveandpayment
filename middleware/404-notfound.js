const notFound = (req,res)=>{
    res.status(404).send({message:"Route Lookig for Does't Exists"})
}
module.exports = notFound;