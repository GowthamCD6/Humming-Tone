const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const createError = require("http-errors")
const db = require("../config/db");
const userAuth = require("../middlewares/userAuth");

exports.register = (req,res,next) => {
    try{
      const {name, emailId, password, phone} = req.body;
      if(!name?.trim() || !emailId?.trim() || !password?.trim() || !phone?.trim()){
        return next(createError.BadRequest('User details missing'));
      }
      // check whether the user already exist
      let checkSql = "select * from users where emailId = ? or phone = ?";
      db.query(checkSql,[emailId, phone],(error,result) => {
        if(error || result.length > 0){
            return next(error || createError.BadRequest("User already exist!"));
        }
        // create password hash
        bcrypt.hash(password,10,(err, hash) => {
           if(err)return next(err);
           // insert user
           let insertSql = "insert into users(name, emailId, password_hash, phone) values (?, ?, ?, ?)";
           db.query(insertSql,[name, emailId, hash, phone],(error,result) => {
           if(error)return next(error);
           res.send("User registered successfully!");
        })
           
        })
      })
    }
    catch(error){
        next(error);
    }
}

exports.login = (req,res,next) => {
    try{
        const{emailId, password} = req.body;
        if(!emailId?.trim() || !password?.trim()){
            return next(createError.BadRequest("Email or password is empty!"));
        }
        let sql = "select id, password from users where emailId = ?";
        db.query(sql,[emailId],(error,result) => {
            if(error)return next(error);
            if(result.length == 0)return next(createError.Unauthorized("Invalid Email"));

            const user= result[0];

            bcrypt.compare(password, user.password)
            .then((isMatch) => {
                if(!isMatch){
                    return next(createError.Unauthorized('Invalid Password'));
                }
            })

            const token = jwt.sign({id:user.id}, process.env.JWT_SECRET,{expiresIn:"1m"});

            res.cookie("token", token, {
                httpOnly: true,
                secure: false, // change to true in production with HTTPS
                sameSite: "lax" // for localhost testing
            })

            res.json({
                message:"User loggedIn successfully"
            })
        })
    }
    catch(error){
        next(error);
    }
}

exports.logout = (req,res,next) => {
    try{
       res.clearCookie('token',{httpOnly: true, secure: true, sameSite: 'Strict'})
       res.send('User logged out successfully!');
    }
    catch(error){
        next(error);
    }
}