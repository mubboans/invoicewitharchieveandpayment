const redisClient = require('redis').createClient(6379,'127.0.0.1');
(async () => {
    await redisClient.connect();
    // await redisClient.del('customer'); 
})();
const connectRedis=()=>{
    redisClient.on("ready", () => {
        console.log("Connected!");
    });
    // return redisClient.connect().then((result) => {
    //     console.log('connected to Redis',result);  
    // }).catch((err) => {
    //    console.log(err,'error connecting to Redis'); 
    // });
}

const setCache = (name,data) => {
    return new Promise ((resolve, reject) => {
        // console.log(data,'cache data');
        redisClient.set(name,data).then((result) => {
            // console.log();
            return resolve({})
        }).catch((err) => {
           console.log(err,'error setting'); 
        });
    })
    
}

const getCache = (name) => {
    return new Promise ((resolve, reject) => {
        // console.log(name,redisClient,'getCache');
        redisClient.get(name).then((data) => {
            console.log('resolve');
            return resolve([null,data]);
        }).catch((err) => {
            console.log(err,'error');
            return reject([err,null]);
        })        
    })
}
module.exports = {
    setCache,getCache,connectRedis
}