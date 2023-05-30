const jwt = require('jsonwebtoken');
require('dotenv').config()

const authenticator = (req,res,next)=>{
    let token = req.headers.authorization;

    if(token){
        jwt.verify(token, process.env.secretkey , function(err, decoded) {
            // console.log(decoded.foo) // bar
            if(err){
                console.log({msg : err})
                res.status(500).send({msg : err.message});
            }else{
                req.body.userID = decoded.userID
                req.body.email = decoded.email;

                next()
            }
        });
    }else{
        res.status(403).send({msg:"Access Denied, Please Login first"})
    }
}

module.exports = {authenticator}