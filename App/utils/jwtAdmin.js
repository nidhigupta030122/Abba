const User = require("../models/adminModel")


// Create token and saving in cookie

const sendToken = async(message,user, statusCode, res) => {
  console.log(user)
  const token = user.adminjwtTokken();
  console.log(token)
 
 //  await User.updateOne({_id:user._id},{$set:{token:token}});

  // const data = await User.findById({_id:user._id}).select(" token");

  //option for cookie
  // const options = {
  //   expires: new Date(
  //     Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
  //   ),
  //   httpOnly: true,
  // };
  res.status(statusCode).json({
    state: true,
    message :message,
    data:token,
    });
};

module.exports = sendToken;