const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const db = require("../config/db");

const userAuth = (req,res,next) => {
    try{
        let token = req.cookies?.token;
        if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }
        if(!token){
            return next(createError.BadRequest("Authentication token is missing"));
        }
        const decodedMessage = jwt.verify(token, process.env.JWT_SECRET);
        db.query("select * from users where id = ?",[decodedMessage.id],(error,result) => {
            if(error)return next(createError.BadRequest(error));
            if(result.length === 0){
                return next(createError.NotFound());
            }
            req.user = decodedMessage.id;
            next();
        })
    }
    catch(error){
        next(error);
    }
}

module.exports = userAuth;