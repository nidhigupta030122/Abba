
let modelUser = require('../models/userModel.js');
const User = require("../models/adminModel"); 
let jwt = require('jsonwebtoken');

module.exports.checkUserAuth = async (req, res, next) => {
  let token;
  const { authorization } = req.headers

  console.log("bbbbbbbbbbbbbbbbbbbbbbbbbb",authorization)
  if (authorization && authorization.startsWith('Bearer')) {
    try {
      // Get Token from header
      token = authorization.split(' ')[1]

      // Verify Token
      const {userID} = await jwt.verify(token, process.env.JWT_SECRET_KEY)
      console.log("userId",userID);
      // Get User from Token
      req.user = await modelUser.findById(userID).select('-password')
      console.log("middleware",req.user);
      next()
    } catch (error) {
      console.log("what error..................",error)
      res.status(401).send({ "status": "failed", "message": "Unauthorized User" })
    }
  }
  if (!token) {
    res.status(401).send({ "status": "failed", "message": "Unauthorized User, No Token" })
  }
}

exports.isAuthenticatedAdmin = (async (req, res, next) => {
  let token;
  const { authorization } = req.headers;
  if (authorization && authorization.startsWith("Bearer") ) {
    try {
    //Get Token from header
    token = authorization.split(" ")[1];
    //Verify Token
    const { userID } = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = userID
    req.user = await User.findById(userID).select('-password')
    next()
  }
  catch (error) {
    console.log(error)
    res.status(401).send({ status:false, message: "Unauthorized Admin" })
  }
}

    if (authorization === undefined) {

      res.status(401).send({ status: false, message: "Unauthorized Admin, No Token" })
      }
     
   
});

