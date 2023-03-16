const { CustomError } = require("../errors/custom-error");

const errorHandler = (err,req,res,next) =>{
    if(err instanceof CustomError){
        return res.status(err.statusCode).send({message:"Failed to Process",error:err.message,success:false})
    }
    return res.status(500).send({message:"Something went wrong on Server",success:false,error:err})
}
module.exports = errorHandler;