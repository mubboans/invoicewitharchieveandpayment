class CustomError extends Error {
    constructor ( message,statusCode){
        super(message);
        this.statusCode= statusCode
    }
}
const createCustomError = (mssg,code)=>{
        return new CustomError(mssg,code);
}
module.exports ={
createCustomError,
CustomError
}