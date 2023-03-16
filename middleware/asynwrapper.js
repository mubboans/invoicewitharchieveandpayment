const asyncWrapper = (fn) =>{
   return async(req,res,next)=>{
       try{
        await fn(req,res,next)
       }
       catch(err){
        throw err;
       }
   }
}
module.exports = asyncWrapper;