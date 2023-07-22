let UserModel = require('../models/userModel.js')
let TransactionModel = require("../models/transactionModel.js");
let qrModel = require('../models/userQrModel.js')
let accountModel = require('../models/accountModel.js')
let userSubscriptionModel=require("../models/userSubscriptionModel.js")
let userContactModel=require("../models/userContactUs.js")
let bcrypt = require('bcrypt')
let jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const SendOtp = require("../middlewares/sendOtp");

const smtpTransport = require('nodemailer-smtp-transport')
//*****************************************************************************************************************************/
// User signup   //
//****************************************************************************************************************************/

module.exports.signup = async (req, res) => {
  // console.log(".....................",req.body);
  const {
    name,
    email,
    phoneNumber,
    countryCode,
    countryName,
    password,
    password_confirmation,
    mobile_token
  } = req.body;
  // console.log(".....................",req.body);
  if (name && email && password) {
    const user = await UserModel.findOne({ email: email });
    console.log("data", user);
    if (user) {
      res.status(401).send({
        success: false,
        Status: "401",
        message: "Email already exists",
      });
    } else {
      const match_number = await UserModel.findOne({
        phoneNumber: phoneNumber,
      });
      if (match_number) {
        res.status(401).send({
          success: false,
          Status: "401",
          message: "Phone number already exists",
        });
      } else {
        if (password === password_confirmation) {
          try {
            const otp = Math.floor(1000 + Math.random() * 9000);
            console.log("otp", otp);
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);
            const data = new UserModel({
              name: name,
              email: email,
              phoneNumber: phoneNumber,
              password: hashPassword,
              email_otp: otp,
              countryCode,
              countryName,
              mobile_token
            });
            await data.save();
            // Generate JWT Token
            const token = jwt.sign(
              { userID: data._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "5d" }
            );
            // SendOtp(email, null, otp);
            var transporter = nodemailer.createTransport({
              host: 'abbawallet.com',
              port: 465,
              auth: {
                user: 'noreply@abbawallet.com',
                pass: 'Noreply@ABBA202201',
              }
            });
            const mailOptions = {
              from: "noreply@abbawallet.com",
              to: email,
              subject: 'OTP from ABBA Wallet',
              html: `<div><span>Hello ${name ? name : ""}</span>
            <br /><br />
            <span>
              Thank you for choosing ABBA Wallet. Use the following OTP to complete your
              Sign Up procedures. This OTP is valid for 4 minutes only.
            </span>
            <br /><br />
            <b>${otp}</b>
            <br /><br />
            <span>If you didn’t request this, you can ignore this email.</span>
            <br /><br />
            <span>
              Remember, no one from ABBA Payments Ltd ("ABBA Wallet") will ever contact
              you, either by email or phone, to request your password.
            </span>
            <br /><br />
            <span>
              Regards,<br />
              ABBA Payments Ltd
            </span></div>`,
            };

            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                return console.log(error);
              }
              console.log("Otp sent your email:", info.messageId, info.response);
            });
            setTimeout(async () => {
              await UserModel.updateOne({ email }, { $set: { email_otp: "" } })
                .then((res) => console.log(res))
                .catch((err) => console.log(err));
            }, 240000);
            res.status(201).send({
              success: true,
              status: "200",
              message: "Registration Successfully",
              data,
              token: token,
            });
          } catch (error) {
            console.log(error);
            res.status(401).send({
              success: false,
              Status: "401",
              message: "Unable to Register",
            });
          }
        } else {
          res.status(401).send({
            success: false,
            Status: "401",
            message: "Password And password_confirmation Doesn't Match",
          });
        }
      }
    }
  } else {
    res.status(401).send({
      success: false,
      status: "401",
      message: "All fields are required",
    });
  }
};
//*****************************************************************************************************************************/
// Login or sign up with google  //
//****************************************************************************************************************************/
module.exports.googleLogin = async (req, res, next) => {
  try {

    const { name, email_id, social_id, mobile_token, user_img } = req.body;
    const checkEmail = await UserModel.findOne({ email: email_id });
    const checkSocial = await UserModel.findOne({ social_id: social_id });


    if (!checkEmail && !checkSocial) {
      // const signup = await UserModel.create({
      //   name,
      //   email: email_id,
      //   social_id: social_id,
      //   mobile_token,
      //   profile: user_img,
      //   email_verified: true,
      // });
      // const token = jwt.sign(
      //   { userID: signup._id },
      //   process.env.JWT_SECRET_KEY,
      //   {
      //     expiresIn: "5d",
      //   }
      // );
      return res.status(201).json({
        status: false,
        message: "You are not register user",
      });
    } else {
      const data = await UserModel.findOneAndUpdate(
        {
          $and: [{ email: email_id }, { social_id: social_id }],
        },
        { $set: { mobile_token } },
        { new: true }
      );


      // if (!data.account_status) throw new Error("you account is deactivated");
      // if (data.length == 0) {
      //   throw new Error("You are AlReady Register with same email");
      // } else {
      // const datas = await UserModel.findOne({ email: email });
      const token = jwt.sign({ userID: data._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: "5d",
      });
      return res.status(200).json({
        status: true,
        message: "Login succesfully",
        token: token,
        response: data,
      });
      // }
    }
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
      errorline: err.stack
    });
  }
};
//*****************************************************************************************************************************/
// add phone number api   //
//****************************************************************************************************************************/

module.exports.addPhoneNumber = async (req, res) => {
  try {
    const { _id } = req.user;
    const { phoneNumber, countryCode, countryName } = req.body;
    const check = await UserModel.findOne({ phoneNumber });
    if (check) throw new Error("This phone number already exists!");
    const otp = Math.floor(1000 + Math.random() * 9000);
    const result = await UserModel.findOneAndUpdate(
      { _id },
      { $set: { phoneNumber, countryCode, countryName ,phone_otp: otp } },
      { new: true }
    );
    SendOtp(null, result.countryCode + result.phoneNumber, otp, result.name);
    res.status(200).send({
      status: true,
      message: "phone number added successfully",
      response: result,
    });
  } catch (error) {
    res.status(401).json({
      status: false,
      message: error.message,
    });
  }
};

//*****************************************************************************************************************************/
// add currency api   //
//****************************************************************************************************************************/

module.exports.addCurrency = async (req, res) => {
  try {
    const { currency, currencysymbol } = req.body;
    const { _id } = req.user;
    const result = await UserModel.findOneAndUpdate(
      { _id },
      { $set: { currency: currency, currencysymbol: currencysymbol } },
      { new: true }
    );
    res.status(200).send({
      status: true,
      message: "Currency Updated Successfully!!",
      response: result,
    });
  } catch (error) {
    res.status(401).send({
      status: false,
      message: error.message,
      stack: error.stack,
    });
  }
};

//*****************************************************************************************************************************/
// fetch single user   //
//****************************************************************************************************************************/
module.exports.fetchUser = async (req, res) => {
  try {
    const { email } = req.body;
    const data = await UserModel.findOne({
      $or: [{ email }, { phoneNumber: email }],
    });
    res.status(200).send({
      status: true,
      data,
    });
  } catch (error) {
    res.status(401).send({
      status: false,
      message: error.message,
    });
  }
};
//*****************************************************************************************************************************/
// verify otp send your mail   //
//****************************************************************************************************************************/
module.exports.SignUpverifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const checkemail = await UserModel.findOne({ email: email });
    if (checkemail.email_otp !== otp) {
      throw new Error("Invalid Otp")
    } else {
      await UserModel.updateOne({ email: email },
        {
          $set: {
            email_verified: true,
          }
        })
      const checkotp = await UserModel.findOne({ email: email });
      return res.status(200).json({
        status: true,
        message: "Otp verified  successfully",
        respose: checkotp,
      })
    }
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    })
  }
}

//*****************************************************************************************************************************/
// send Phone Otp   //
//****************************************************************************************************************************/

module.exports.sendPhoneOtp = async (req, res) => {
  try {
    const { phoneNumber, newNumber, countryCode, name, email } = req.body;
    const check = await UserModel.findOne({ phoneNumber });
    // if (!check) throw new Error("entered number not registered");
    const otp = Math.floor(1000 + Math.random() * 9000);
    if (check) {
      const data = await UserModel.findOneAndUpdate(
        { phoneNumber },
        { $set: { phone_otp: otp } },
        { new: true }
      );
      SendOtp(null, data.countryCode + data.phoneNumber, otp, data.name);
      res.status(200).send({
        status: true,
        message: "Otp has been sent to your phone number",
        data,
      });
    } else {
      const data = await UserModel.findOneAndUpdate(
        { email },
        { $set: { phone_otp: otp } },
        { new: true }
      );
      SendOtp(null, countryCode + newNumber, otp, name);
      res.status(200).send({
        status: true,
        message: "Otp has been sent to your phone number",
      });

    }
  } catch (error) {
    res.status(401).send({
      status: false,
      message: error.message,
    });
  }
};

//*****************************************************************************************************************************/
// verify Phone Otp   //
//****************************************************************************************************************************/

module.exports.verifyPhoneOtp = async (req, res) => {
  try {
    const { phoneNumber, otp, newNumber, countryName, countryCode } = req.body;
    const check = await UserModel.findOne({ phoneNumber });
    if (!check) throw new Error("entered number not registered");
    if (check.phone_otp !== otp) throw new Error("Entered otp is incorrect.");
    const data = await UserModel.findOneAndUpdate(
      { phoneNumber },
      { $set:
         { 
          phoneNumber: newNumber,
          countryName: countryName, 
          countryCode: countryCode, 
          phone_verified: true ,
          phone_otp:null
        } 
        },
      { new: true }
    );
    res.status(200).send({
      status: true,
      message: "Otp verified Successfully",
      data,
    });
  } catch (error) {
    res.status(401).send({
      status: false,
      message: error.message,
    });
  }
};


//*****************************************************************************************************************************/
// Add Question Ans  Api  //
//****************************************************************************************************************************/

module.exports.addQuestionAns = async (req, res, next) => {
  try {
    const { email, questions, answers } = req.body;
    await UserModel.updateOne({ email: email },
      {
        $set: {
          questions: questions.toLowerCase(),
          answers: answers.toLowerCase(),
        }
      })
    const question_ans = await UserModel.findOne({ email: email });
    return res.status(200).json({
      status: true,
      message: "Question & Answer Updated Successfully",
      response: question_ans,
    })
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    })
  }
}

//*****************************************************************************************************************************/
// Question Ans verification  Api   //
//****************************************************************************************************************************/
module.exports.verifyQusetionAns = async (req, res, next) => {
  try {
    const { email, questions, answers } = req.body;
    const checkemail = await UserModel.findOne({ email: email });
    if (questions.match(checkemail.questions) && answers.match(checkemail.answers)) {
      await UserModel.updateOne({ email: email }, {
        $set: {
          questions: questions.toLowerCase(),
          answers: answers.toLowerCase(),
          que_ans_verified: true,
        }
      })
      const questionans = await UserModel.findOne({ email: email });
      return res.status(200).json({
        status: true,
        messaage: "Questions And Answers Verified Successfully",
        respose: questionans,
      })
    } else {
      throw new Error("Your Question And Answer Do'not Matched")
    }
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    })
  }
}

//*****************************************************************************************************************************/
// Create Confirm Pin  Api   //
//****************************************************************************************************************************/
module.exports.createPin = async (req, res) => {
  try {
    const { pin } = req.body;
    await UserModel.updateOne({ _id: req.user._id },
      {
        $set: {
          pin: pin,
          pin_verified: true
        }
      })
    const createpin = await UserModel.findOne({ _id: req.user._id });
    return res.status(200).json({
      status: true,
      message: "Pin generated successfully",
      respose: createpin,
    })
  } catch (err) {
    return res.status(401).json({
      status: true,
      message: err.message,
    })
  }
};

//*****************************************************************************************************************************/
// Change  Pin  Api   //
//****************************************************************************************************************************/
module.exports.changePin = async (req, res, next) => {
  try {
    const { old_pin, new_pin, confirm_pin } = req.body;
    const checkpin = await UserModel.findOne({ _id: req.user._id });
    if (checkpin.pin !== old_pin) {
      throw new Error("Entered old pin is incorrect")
    } else {
      if (new_pin !== confirm_pin) {
        throw new Error("Your new_pin and confirm pin doesn't match")
      }
      await UserModel.updateOne({ _id: req.user._id }, {
        $set: {
          pin: new_pin,
        }
      })
      const checkpin = await UserModel.findOne({ _id: req.user._id });
      return res.status(200).json({
        status: true,
        message: "Pin updated successfully",
        respose: checkpin,
      })
    }
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    })
  }
}

//*****************************************************************************************************************************/
//Confrim pin Api  //
//****************************************************************************************************************************/
module.exports.confrimPin = async (req, res) => {
  try {
    let { pin } = req.body;
    let { _id } = req.user;
    let data = await UserModel.findOne({ _id });

    if (data.pin !== pin) {
      throw new Error("Pin is incorrect");
    }
    res.status(200).json({
      status: true,
      message: "Pin is correct",
    });
  } catch (error) {
    return res.status(401).json({
      status: false,
      message: error.message,
    });
  }
};


//*****************************************************************************************************************************/
//Update Profile Images Api  //
//****************************************************************************************************************************/
module.exports.updateProfileImages = async (req, res) => {
  try {
    const updateImges = await UserModel.findByIdAndUpdate({ _id: req.user._id },
      {
        $set: {
          profile: "https://app.abbawallet.com/upload/" + req.file?.filename
        },
      }, { new: true }
    )
    return res.status(200).json({
      status: true,
      message: "Updated",
      response: updateImges,
    });

  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    });
  }

}

//*****************************************************************************************************************************/
//Update Profile  Api  //
//****************************************************************************************************************************/
module.exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phoneNumber, countryName, countryCode } = req.body;
    const userData = await UserModel.findOne({ _id: req.user._id });

    if (userData.email == email && userData.phoneNumber == phoneNumber) {
      const data = await UserModel.findByIdAndUpdate(
        { _id: req.user._id },
        {
          $set: {
            name: name ? name : userData.name,
            countryCode: countryCode ? countryCode : userData.countryCode,
            countryName: countryName ? countryName : userData.countryName,
          },
        },
        { new: true }
      );
      res.status(200).send({
        success: false,
        Status: "200",
        message: "Updated successfully",
        response: data,
      });
    }
    if (userData.phoneNumber == phoneNumber) {
      const checkemail = await UserModel.findOne({ email: email });
      if (!checkemail) {
        const otp = Math.floor(1000 + Math.random() * 9000);
        const data = await UserModel.findByIdAndUpdate(
          { _id: req.user._id },
          {
            $set: {
              name: name ? name : userData.name,
              email: userData.email,
              email_otp: otp,
              countryCode: countryCode ? countryCode : userData.countryCode,
              countryName: countryName ? countryName : userData.countryName,
            },
          },
          { new: true }
        );
        const fetchdata = await UserModel.findOne({ email: email });
        //   SendOtp(email, null, fetchdata.otp, fetchdata.name);
        // Sending Otp to email
        var transporter = nodemailer.createTransport({
          host: 'abbawallet.com',
          port: 465,
          auth: {
            user: 'noreply@abbawallet.com',
            pass: 'Noreply@ABBA202201',
          }
        });
        const mailOptions = {
          from: "noreply@abbawallet.com",
          to: email,
          subject: 'OTP from ABBA Wallet',
          html: `<div><span>Hello ${name}</span>
          <br /><br />
          <span>
            Thank you for choosing ABBA Wallet. As per your request, we are sending you your One-Time Password (OTP) for accessing your account. 
            This OTP is valid for 4 minutes only.
          </span>
          <br /><br />
          <b>${otp}</b>
          <br /><br />
          <span>If you didn’t request this, you can ignore this email.</span>
          <br /><br />
          <span>
            Remember, no one from ABBA Payments Ltd ("ABBA Wallet") will ever contact
            you, either by email or phone, to request your password.
          </span>
          <br /><br />
          <span>
            Regards,<br />
            ABBA Payments Ltd
          </span></div>`,
        };
        if (email) {
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              return console.log(error);
            }
            console.log("Otp sent your email:", info.messageId, info.response);
          });
        }
        setTimeout(async () => {
          await UserModel.updateOne({ email }, { $set: { email_otp: "" } })
            .then((res) => console.log(res))
            .catch((err) => console.log(err));
        }, 240000);
        res.status(200).send({
          success: true,
          Status: "200",
          message: "OTP sent please check",
          response: data,
        });
      }
      else {
        const data = await UserModel.findByIdAndUpdate(
          { _id: req.user._id },
          {
            $set: {
              name: name ? name : userData.name,
              countryCode: countryCode ? countryCode : userData.countryCode,
              countryName: countryName ? countryName : userData.countryName,
            },
          },
          { new: true }
        );
        res.status(200).send({
          success: false,
          Status: "200",
          message: "email is already exist.",
          response: data,
        });
      }
    }
    else if (userData.email == email) {
      const checkphone = await UserModel.findOne({ phoneNumber: phoneNumber });
      if (!checkphone) {
        const otp = Math.floor(1000 + Math.random() * 9000);
        const email_otp = Math.floor(1000 + Math.random() * 9000);
        const data = await UserModel.findByIdAndUpdate(
          { _id: req.user._id },
          {
            $set: {
              name: name ? name : userData.name,
              phone_otp: otp,
              email_otp: email_otp,
              phoneNumber: userData.phoneNumber,
              countryCode: countryCode ? countryCode : userData.countryCode,
              countryName: countryName ? countryName : userData.countryName,
            },
          },
          { new: true }
        );

        // const fetchdata = await UserModel.findOne({ phoneNumber : phoneNumber });
        SendOtp(null, userData.countryCode + phoneNumber, otp, userData.name);
        setTimeout(async () => {
          await UserModel.updateOne({ phoneNumber }, { $set: { phone_otp: "" } })
            .then((res) => console.log(res))
            .catch((err) => console.log(err));
        }, 240000);

        var transporter = nodemailer.createTransport({
          host: 'abbawallet.com',
          port: 465,
          auth: {
            user: 'noreply@abbawallet.com',
            pass: 'Noreply@ABBA202201',
          }
        });
        const mailOptions = {
          from: "noreply@abbawallet.com",
          to: email,
          subject: 'OTP from ABBA Wallet',
          html: `<div><span>Hello ${name}</span>
          <br /><br />
          <span>
            Thank you for choosing ABBA Wallet. As per your request, we are sending you your One-Time Password (OTP) for accessing your account.
            This OTP is valid for 4 minutes only.
          </span>
          <br /><br />
          <b>${email_otp}</b>
          <br /><br />
          <span>If you didn’t request this, you can ignore this email.</span>
          <br /><br />
          <span>
            Remember, no one from ABBA Payments Ltd ("ABBA Wallet") will ever contact
            you, either by email or phone, to request your password.
          </span>
          <br /><br />
          <span>
            Regards,<br />
            ABBA Payments Ltd
          </span></div>`,
        };
        if (email) {
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              return console.log(error);
            }
            console.log("Otp sent your email:", info.messageId, info.response);
          });
        }
        setTimeout(async () => {
          await UserModel.updateOne({ email }, { $set: { email_otp: "" } })
            .then((res) => console.log(res))
            .catch((err) => console.log(err));
        }, 240000);
        return res.status(200).json({
          success: true,
          message: "OTP sent please check",
          response: data,
        });
      }
      else {
        res.status(200).send({
          success: false,
          Status: "200",
          message: "Phone number is already exist.",
        });
      }
    }
    else {
      const checkphone = await UserModel.findOne({ phoneNumber: phoneNumber });
      const checkemail = await UserModel.findOne({ email: email });
      if (!checkphone && !checkemail) {
        const otp = Math.floor(1000 + Math.random() * 9000);
        const data = await UserModel.findByIdAndUpdate(
          { _id: req.user._id },
          {
            $set: {
              name: name ? name : userData.name,
              email: userData.email,
              email_otp: otp,
              phoneNumber: userData.phoneNumber,
              phone_otp: otp,
              countryCode: countryCode ? countryCode : userData.countryCode,
              countryName: countryName ? countryName : userData.countryName,
            },
          },
          { new: true }
        );
        const fetchdata = await UserModel.findOne({ phoneNumber: phoneNumber });
        SendOtp(null, userData.countryCode + phoneNumber, otp, userData.name);
        setTimeout(async () => {
          await UserModel.updateOne({ phoneNumber }, { $set: { phone_otp: "" } })
            .then((res) => console.log(res))
            .catch((err) => console.log(err));
        }, 240000);
        //   SendOtp(email, null, fetchdata.otp, fetchdata.name);
        // Sending Otp to email
        var transporter = nodemailer.createTransport({
          host: 'abbawallet.com',
          port: 465,
          auth: {
            user: 'noreply@abbawallet.com',
            pass: 'Noreply@ABBA202201',
          }
        });
        const mailOptions = {
          from: "noreply@abbawallet.com",
          to: email,
          subject: 'OTP from ABBA Wallet',
          html: `<div><span>Hello ${name}</span>
            <br /><br />
            <span>
              Thank you for choosing ABBA Wallet. As per your request, we are sending you your One-Time Password (OTP) for accessing your account.
              This OTP is valid for 4 minutes only.
            </span>
            <br /><br />
            <b>${otp}</b>
            <br /><br />
            <span>If you didn’t request this, you can ignore this email.</span>
            <br /><br />
            <span>
              Remember, no one from ABBA Payments Ltd ("ABBA Wallet") will ever contact
              you, either by email or phone, to request your password.
            </span>
            <br /><br />
            <span>
              Regards,<br />
              ABBA Payments Ltd
            </span></div>`,
        };
        if (email) {
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              return console.log(error);
            }
            console.log("Otp sent your email:", info.messageId, info.response);
          });
        }
        setTimeout(async () => {
          await UserModel.updateOne({ email }, { $set: { email_otp: "" } })
            .then((res) => console.log(res))
            .catch((err) => console.log(err));
        }, 240000);
        return res.status(200).json({
          success: true,
          message: " OTP sent please check",
          response: data,
        });
      }
      else {
        res.status(200).send({
          success: false,
          Status: "200",
          message: " Phone number and email is already exist.",
        });
      }
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
      stack: error.stack,
    });
  }
};

//*****************************************************************************************************************************/
//Email Verify Otp  Api  //
//****************************************************************************************************************************/

module.exports.verifyemailotp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await UserModel.findOne({ _id: req.user._id });
    if (user.email_otp !== otp) {
      res.status(401).json({
        status: false,
        message: "Wrong OTP",
      });
    }
    else {
      await UserModel.updateOne(
        { email: email },
        { $set: { otp_verified: "true" } }
      );
      const updateemail = await UserModel.findByIdAndUpdate(
        { _id: req.user._id },
        {
          $set: {
            email: email,
            phone_verified: false,
          },
        },
        { new: true }
      );

      res.status(200).json({
        status: true,
        message: "Otp verfied successfully",
        data: updateemail,
      });
    }
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    });
  }
};

//*****************************************************************************************************************************/
//Fetch Profile  Api  //
//****************************************************************************************************************************/
module.exports.fetchProfile = async (req, res) => {
  try {
    const fetchProfile = await UserModel.findOne({ _id: req.user._id });
    return res.status(200).json({
      status: true,
      message: "Profile Fetch Successfully",
      response: fetchProfile,
    })

  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    })
  }
}

//phoneNumberVerifyOtp.....................................................................................//
module.exports.verifyOtpPhoneNumber = async (req, res) => {
  try {
    const { otp } = req.body
    console.log(req.body);
    const saved = await UserModel.findOne({ otp: otp })
    if (saved) {
      res.status(401).send({ "success": "True", "status": "200", "message": "OTP verify succesfully" })
    } else {
      res.status(401).send({ "success": "false", "status": "401", "message": "Otp InValid" })

    }
  } catch (err) {
    console.log("error", err);
    res.status(401).send({ "success": "false", "status": "401", "message": "Somethin Went Wrong" })
  }
}

//*****************************************************************************************************************************/
//Login Api  //
//****************************************************************************************************************************/
module.exports.Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (password && email) {
      const data = await UserModel.findOne({
        $or: [{ email: email }, { phoneNumber: email }],
      });
      if (data == null || data == undefined || data == "") {
        res.status(200).send({
          success: false,
          status: "200",
          message: "You are not a Registered User",
        });
      }
      //   if (!data.account_status) throw new Error("you account is deactivated");
      const token = jwt.sign(
        { userID: data._id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "5d" }
      );
      if(data.social_id&&data != null){
        res.status(201).send({
          success: false,
          status: "201",
          message: "You are register with social account",
        });
      }
     else if (data != null) {
      
        const isMatch = await bcrypt.compare(password, data.password);
        if ((data.email === email || data.phoneNumber === email) && isMatch) {
          if (data.account_status === false) {
            await UserModel.findOneAndUpdate(
              { email: email },
              {
                $set: {
                  account_status: true,
                },
              },
              { new: true }
            );
          }
          const checkemail = await UserModel.findOne({ email: email });
          if (data.email_verified == true && data.phone_verified == true && data.pin_verified == true) {
            const token = jwt.sign(
              { userID: data._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "5d" }
            );

            if (!data.isLoggedIn) {
              let result = await UserModel.findOneAndUpdate(
                { email: data.email },
                { $set: { isLoggedIn: true } },
                { new: true }
              );
              res.status(200).send({
                success: true,
                status: "200",
                message: "Login Successfully",
                data: result,
                token: token,
              });
            } else {
              res.status(200).send({
                success: true,
                status: "200",
                message: "Login Successfully",
                data,
                token: token,
              });
            }
          } else {
            res.status(401).send({
              success: false,
              status: "401",
              message: "You are not a Verified user",
              data,
              token: token,
            });
          }
        } else {
          res.status(401).send({
            success: false,
            status: "401",
            message: "Email or Password is not Valid",
          });
        }
      } else {
        res.status(200).send({
          success: false,
          status: "200",
          message: "You are not a Registered User",
        });
      }
    } else {
      res.status(401).send({
        success: false,
        status: "401",
        message: "All Fields are Required",
      });
    }
  } catch (error) {
    console.log(error);
    res
      .status(401)
      .send({ success: false, status: "401", message: error.message });
  }
};


/////////firebaseSendOtp
var unirest = require("unirest");
module.exports.sendSms = (req, res) => {

  var request = unirest("POST", "https://www.fast2sms.com/dev/bulkV2");

  request.headers({
    authorization: "pruEedJpPwysi5wa0SefSQTmDmEDMfqSsJU9aLJIKbH3S3wHNbFQnW8XLWLm"
  });

  request.form({
    sender_id: "FTWSMS", // Set your own "sender_id"
    message: "4525", // template id
    language: "english",
    route: "v3", // Transactional Route SMS
    variables: "{#AA#}",
    numbers: "7253972939" // Number present in GET request
  });

  request.end(function (res) {
    if (res.error) console.log("error at otp");

    console.log("data", res.body);
  });
  // response send back
  res.send({
    "message": "success"
  });

  // const fast2sms = require('fast-two-sms')
  // var options = {
  //   authorization : "pruEedJpPwysi5wa0SefSQTmDmEDMfqSsJU9aLJIKbH3S3wHNbFQnW8XLWLm",
  //    message : 'YOUR_MESSAGE_HERE1223456' , 
  //    numbers : ['7253972939']} 
  // fast2sms.sendMessage(options)
  // .then((data)=>{
  // console.log("response",data);
  // }) .catch((error)=>{
  //   console.log("err",error);
  // })
}


//*****************************************************************************************************************************/
//forgot Password Api  //
//****************************************************************************************************************************/

module.exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    // const emailToValidate = email;
    // const emailRegexp = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    // const checkemails = emailRegexp.test(emailToValidate);
    // if (!checkemails) {
    //   throw new Error('Your Email formate Incorrect.check your email')
    // }
    const checkemail = await UserModel.findOne({
      $or: [{ email }, { phoneNumber: email }],
    });

    if (!checkemail) {
      throw new Error("You are Not a Register User")
    } else {
      const otp = Math.floor(1000 + Math.random() * 9000);
      await UserModel.updateOne({ email: email }, {
        $set: {
          otp: otp,
        }
      })
      const checkotp = await UserModel.findOne({ email: email });

      const check =
        checkotp.email === email
          ? "email"
          : checkotp.phoneNumber === email
            ? "number"
            : "none";

      SendOtp(
        check === "email" ? email : null,
        check === "number" ? checkotp.countryCode + email : null,
        otp,
        checkotp
      );
      var transporter = nodemailer.createTransport({
        host: "abbawallet.com",
        port: "465",
        auth: {
          user: "noreply@abbawallet.com",
          pass: "Abba@noreply202301",
        }
      });
      const mailOptions = {
        from: "noreply@abbawallet.com",
        to: email,
        subject: 'OTP from ABBA Wallet',
        html: `<div><span>Hello ${checkotp.name ? checkotp.name : ""}</span>
        <br /><br />
        <span>
          Thank you for choosing ABBA Wallet. As per your request, we are sending you your One-Time Password (OTP) for accessing your account.
          This OTP is valid for 4 minutes only.
        </span>
        <br /><br />
        <b>${otp}</b>
        <br /><br />
        <span>If you didn’t request this, you can ignore this email.</span>
        <br /><br />
        <span>
          Remember, no one from ABBA Payments Ltd ("ABBA Wallet") will ever contact
          you, either by email or phone, to request your password.
        </span>
        <br /><br />
        <span>
          Regards,<br />
          ABBA Payments Ltd
        </span></div>`,
      };
      if (check === "email") {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error);
          }
          console.log("Otp sent your email:", info.messageId, info.response);
        });
      }
      setTimeout(async () => {
        await UserModel.updateOne({ email }, { $set: { otp: "" } })
          .then((res) => console.log(res))
          .catch((err) => console.log(err));
      }, 240000);

      return res.status(200).json({
        status: true,
        message: `Otp has been sent to your ${check}, Please check your ${check}`,
        respose: checkotp,
      })
    }
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    })
  }
}

//*****************************************************************************************************************************/
//forgot Password Verified otp Api  //
//****************************************************************************************************************************/
module.exports.forgotVerifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const checkemail = await UserModel.findOne({
      $or: [{ email }, { phoneNumber: email }],
    });
    if (checkemail.otp !== otp) {
      throw new Error("Invalid Otp")
    } else {
      await UserModel.updateOne({ email: checkemail.email },
        {
          $set: {
            otp_verified: true,
          }
        })
      const checkotp = await UserModel.findOne({ email: checkemail.email });
      return res.status(200).json({
        status: true,
        message: "Otp verified  successfully",
        respose: checkotp,
      })
    }
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    })
  }
}

//*****************************************************************************************************************************/
//Resent otp Api  //
//****************************************************************************************************************************/

module.exports.resentOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const checkemail = await UserModel.findOne({
      $or: [{ email }, { phoneNumber: email }],
    });
    if (!checkemail) {
      throw new Error(
        "your email doesn't match, please check your email again"
      );
    } else {
      const otp = Math.floor(1000 + Math.random() * 9000);
      const check =
        checkemail.email === email
          ? "email"
          : checkemail.phoneNumber === email
            ? "number"
            : "none";
      let data = await UserModel.findOneAndUpdate(
        { email: checkemail.email },
        {
          $set:
            check === "email"
              ? { email_otp: otp, email_verified: false }
              : { phone_otp: otp, phone_verified: false },
        },
        { new: true }
      );
      const checkotp = await UserModel.findOne({ email: email });
      SendOtp(
        null,
        check === "number" ? checkemail.countryCode + email : null,
        otp
      );
      setTimeout(async () => {
        await UserModel.updateOne({ phoneNumber }, { $set: { phone_otp: "" } })
          .then((res) => console.log(res))
          .catch((err) => console.log(err));
      }, 240000);
      if (check === "email") {
        var transporter = nodemailer.createTransport({
          host: 'abbawallet.com',
          port: 465,
          auth: {
            user: 'noreply@abbawallet.com',
            pass: 'Noreply@ABBA202201',
          }
        });
        const mailOptions = {
          from: "noreply@abbawallet.com",
          to: email,
          subject: 'OTP from Abba Wallet',
          html: `<div><span>Hello ${checkotp.name ? checkotp.name : ""}</span>
        <br /><br />
        <span>
          Thank you for choosing ABBA Wallet. As per your request, we are sending you your One-Time Password (OTP) for accessing your account.
          This OTP is valid for 4 minutes only.
        </span>
        <br /><br />
        <b>${otp}</b>
        <br /><br />
        <span>If you didn’t request this, you can ignore this email.</span>
        <br /><br />
        <span>
          Remember, no one from ABBA Payments Ltd ("ABBA Wallet") will ever contact
          you, either by email or phone, to request your password.
        </span>
        <br /><br />
        <span>
          Regards,<br />
          ABBA Payments Ltd
        </span></div>`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error);
          }
          console.log("Otp sent your email:", info.messageId, info.response);
        });
      }
      setTimeout(async () => {
        await UserModel.updateOne({ email }, { $set: { email_otp: "" } })
          .then((res) => console.log(res))
          .catch((err) => console.log(err));
      }, 240000);
      return res.status(200).json({
        status: true,
        message: "Resent Otp sent successfully",
        Response: data,
      });
    }
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    });
  }
};

//*****************************************************************************************************************************/
//reset password Api  //
//****************************************************************************************************************************/

module.exports.resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;
    const emails = await UserModel.findOne({ email: email });
    if (emails.otp_verified == "true") {
      if (newPassword !== confirmPassword) {
        throw new Error('NewPAssword & Confirm Password Do Not matched')
      }
      const salt = await bcrypt.genSalt(10)
      const hashPassword = await bcrypt.hash(newPassword, salt)
      await UserModel.updateOne({ email: emails.email },
        {
          $set: {
            password: hashPassword,
            otp_verified: false,
          },
        })
      const updatepass = await UserModel.findOne({ email: email });
      return res.status(200).json({
        status: true,
        messaage: "Password  Reset Successfully",
        respose: updatepass,
      })
    } else {
      throw new Error('Your Otp not Verified')
    }
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    })
  }
}


//*****************************************************************************************************************************/
//deactive user Api  //
//****************************************************************************************************************************/

module.exports.deactiveUser = async (req, res) => {
  try {
    const { _id } = req.user;

    const user = await UserModel.updateOne(
      { _id },
      { $set: { account_status: false } }
    );
    // if (user.modifiedCount == 1) throw new Error("something went wrong");
    res.status(200).send({
      status: true,
      messaage: "Account has been deactivated successfully",
    });
  } catch (error) {
    res.status(401).send({
      status: false,
      message: error.message,
      stack: error.stack,
    });
  }
};

//ChangePassword.............................................................
module.exports.changePassword = async (req, res) => {
  const { newPassword, password_confirmation } = req.body
  const password = req.body.oldPassword
  try {
    const users = await UserModel.findOne(req.user._id)
    console.log("data123", users);
    const isMatch = await bcrypt.compare(password, users.password)
    console.log("data1", isMatch);
    if (isMatch == true) {
      if (newPassword && password_confirmation) {
        if (newPassword !== password_confirmation) {
          res.status(401).send({ "success": false, "message": "New Password and Confirm New Password doesn't match" })
        } else {
          const salt = await bcrypt.genSalt(10)
          const newHashPassword = await bcrypt.hash(newPassword, salt)
          await UserModel.findByIdAndUpdate(req.user._id, { $set: { password: newHashPassword } })
          res.status(200).send({ "success": true, "status": "200", "message": "Password changed succesfully" })
        }
      } else {
        res.send({ "success": false, "message": "All Fields are Required" })
      }
    } else {
      res.send({ "success": false, "message": "Old Password is Wrong" })
    }
  } catch (error) {
    console.log("error", error);
    res.send({ "success": false, "message": "Something Went  Wrong" })
  }
}
//generateQrcodePayment
const qr = require('qrcode');
const { updateOne } = require('../models/userModel.js')
const fs = require("fs");
const path = require("path");
// module.exports.qrCode = async (req, res) => {
//   try {
//     let { _id } = req.user;
//     const data1 = await UserModel.findOne({ _id });
//     if (data1.qrCode) {
//       let data = {
//         _id,
//       };
//       const stjson = JSON.stringify(data);
//       // qr.toString(stjson,{type:"terminal"},function(err,code)
//       qr.toDataURL(stjson, async function (err, QrCode) {
//         let qr = QrCode.split(",")[1];
//         const buffer = Buffer.from(qr, "base64");
//         let file = fs.writeFileSync(`public/qrCode_${_id}.png`, buffer);

//         const user = await UserModel.findOneAndUpdate(
//           { _id },
//           {
//             $set: {
//               qrCode: `https://app.abbawallet.com/public/qrCode_${_id}.png`,
//             },
//           }, { new: true }
//         );
//         res.status(200).send({
//           status: true,
//           message: "QR Code Generate succesfully",
//           response: user.qrCode,
//           err
//         });
//         // console.log(".................................", datas);
//       });
//     } else {
//       res.send({ status: true, message: "QR Code fetched successfully", response: data1.qrCode });
//     }
//   } 
  
  
//   catch (error) {
//     res.status(401).send({
//       status: false,
//       message: error.message,
//       stack: error.stack,
//     });
//   }
// };


// Assuming you have the necessary imports and dependencies

// ...

module.exports.qrCode = async (req, res) => {
  try {
    let { _id } = req.user;
    const data1 = await UserModel.findOne({ _id });
    if (!data1.qrCode) {
      let data = {
        _id,
      };
      const stjson = JSON.stringify(data);
      qr.toDataURL(stjson, async function (err, QrCode) {
        let qr = QrCode.split(",")[1];
        const buffer = Buffer.from(qr, "base64");
        const imagePath = path.join(__dirname, '..', '..', 'public', `qrCode_${_id}.png`);
        fs.writeFileSync(imagePath, buffer);
        const user = await UserModel.findOneAndUpdate(
          { _id },
          {
            $set: {
              qrCode: `http://18.219.235.165:8000/public/qrCode_${_id}.png`,
            },
          },
          { new: true }
        );
        res.status(200).send({
          status: true,
          message: "QR Code generated successfully",
          response: user.qrCode,
        });
      });
    } else {
      res.send({ status: true, message: "QR Code fetched successfully", response: data1.qrCode });
    }
  } catch (error) {
    res.status(401).send({
      status: false,
      message: error.message,
      stack: error.stack,
    });
  }
};
//add bankAccount
module.exports.addBankDetail = async (req, res) => {
  const { accountNumber, reaccountNumber, ifscCode, accountHolderName, userId } = req.body
  if (accountNumber && reaccountNumber && ifscCode && userId) {
    try {
      const doc = new accountModel({
        accountNumber: accountNumber,
        reaccountNumber: reaccountNumber,
        ifscCode: ifscCode,
        accountHolderName: accountHolderName,
        userId: userId,

      })
      await doc.save()
      console.log(doc);
      res.status(200).send({ "success": "True", "status": "200", "message": "Add Bank Details  Successfully", })
    } catch (error) {
      console.log(error)
      res.status(401).send({ "success": "false", "Status": "401", "message": "Unable to Add" })
    }
  } else {
    res.status(401).send({ "success": "false", "status": "401", "message": "All fields are required" })
  }
}
//getBankDetails.............................................................................
module.exports.getBankDetails = async (req, res) => {
  const { userId } = req.query
  try {
    const saved_user = await accountModel.findOne({ userId: userId })
    console.log(saved_user);
    if (saved_user != null) {
      res.status(200).send({ "success": "True", "status": "200", "message": "get BankDetails succesfully", saved_user })
    } else {
      res.status(401).send({ "status": "failed", "message": "Something Went Wrong" })
    }
  } catch (err) {
    res.status(401).send({ "success": "True", "status": "failed", "message": "employeeId Is Wrong" })
  }
}
//updateBankDetails
module.exports.updatBank = async (req, res) => {
  const { accountNumber, reaccountNumber, ifscCode, accountHolderName, userId } = req.body;
  console.log(req.body);
  try {
    const saved_user = await accountModel.findOneAndUpdate(
      { userId },
      {
        accountNumber: accountNumber,
        reaccountNumber: reaccountNumber,
        ifscCode: ifscCode,
        accountHolderName: accountHolderName,
      },
    );
    console.log("updateddata", saved_user);
    if (saved_user) {
      res.status(200).send({ "success": "True", "status": "200", "message": "update BankDetails succesfully" })
    } else {
      res.status(401).send({ "success": "false", "status": "401", "message": "Something Went Wrongs" })
    }
  } catch (err) {
    console.log("err", err);
  }
}

// ********************************************************************************Check Qr code Id***********************************************************************************

module.exports.CheckQrCode = async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      return res.status(401).json({
        status: false,
        message: "User not found",
      })
    }
    const data = await UserModel.findOne({ _id: user_id });
    if (!data) {
      return res.status(401).json({
        status: false,
        message: "User not found",
      })
    } else {
      return res.status(200).json({
        status: true,
        message: "User found",
      })
    }
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
      stack: err.stack,
    });
  }
}

///////////////// fetch single user //////////////////////////////////////

module.exports.fetchSingleUser = async (req, res, next) => {
  try {
    const singleuser = await UserModel.findById({ _id: req.body._id });
    return res.status(200).json({
      status: true,
      message: "User fetch successfully",
      response: singleuser,
    });
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    });
  }
};

//*****************************************************************************************************************************/
// Users Transactions API //
//****************************************************************************************************************************/

module.exports.userTransaction = async (req, res) => {
  try {
    let result = await TransactionModel.findOne({
      user_id: req.user.id,
    });
    let contact = result?.transactions?.map((obj) => {
      return obj.contact_id.toString();
    });
    let newcontact = contact?.filter((value, index, orj) => {
      return orj.indexOf(value) === index;
    });
    const user = await UserModel.find({ _id: newcontact });
    return res.status(200).send({
      status: true,
      message: "data fetched successfully",
      response: user,
    });
  } catch (error) {
    return res.status(401).send({
      status: false,
      message: error.message,
    });
  }
};


//*****************************************************************************************************************************/
///////Activate User Account API
//****************************************************************************************************************************/
module.exports.activateuseraccount = async (req, res, next) => {
  try {
    const activateuseraccount = await UserModel.findByIdAndUpdate(
      { _id: req.user._id },
      {
        $set: {
          account_status: true,
        },
      },
      { new: true }
    );
    return res.status(200).json({
      status: true,
      message: "Activate User Account Successfully",
      response: activateuseraccount,
    });
  } catch (error) {
    return res.status(401).json({
      status: false,
      message: error.message,
    });
  }
};

//*****************************************************************************************************************************/
////// Forgot Wallet Pin
//****************************************************************************************************************************/
module.exports.forgotWalletPin = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Email does not exist",
      });
    }
    const otp = Math.floor(1000 + Math.random() * 9000);
    await UserModel.updateOne(
      { email: email },
      {
        $set: {
          wallet_otp: otp,
        },
      }
    );
    const checkotp = await UserModel.findOne({ email: email });
    SendOtp(email, null, otp, checkotp.name);
    var transporter = nodemailer.createTransport({
      host: "abbawallet.com",
      port: "465",
      auth: {
        user: "noreply@abbawallet.com",
        pass: "Abba@noreply202301",
      }
    });
    const mailOptions = {
      from: "noreply@abbawallet.com",
      to: email,
      subject: 'OTP from ABBA Wallet',
      html: `<div><span>Hello ${checkotp.name ? checkotp.name : "Sir/Mam"}</span>
      <br /><br />
      <span>
        Thank you for choosing ABBA Wallet. As per your request, we are sending you your One-Time Password (OTP) for accessing your account.
        This OTP is valid for 4 minutes only.
      </span>
      <br /><br />
      <b>${otp}</b>
      <br /><br />
      <span>If you didn’t request this, you can ignore this email.</span>
      <br /><br />
      <span>
        Remember, no one from ABBA Payments Ltd ("ABBA Wallet") will ever contact
        you, either by email or phone, to request your password.
      </span>
      <br /><br />
      <span>
        Regards,<br />
        ABBA Payments Ltd
      </span></div>`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log("Otp sent your email:", info.messageId, info.response);
    });
    setTimeout(async () => {
      await UserModel.updateOne({ email }, { $set: { wallet_otp: "" } })
        .then((res) => console.log(res))
        .catch((err) => console.log(err));
    }, 240000);
    return res.status(201).json({
      status: true,
      message: "Otp has been sent to your email, Please check your email",
      response: checkotp,
    });
  } catch (error) {
    return res.status(401).json({
      status: false,
      message: error.message,
      errorline: error.stack,
    });
  }
};

//*****************************************************************************************************************************/
//forgot WalletPin Verified otp Api  //
//****************************************************************************************************************************/
module.exports.forgotWalletPinOtp = async (req, res) => {
  try {
    const { email, wallet_otp } = req.body;
    const checkemail = await UserModel.findOne({ _id: req.user._id });
    if (checkemail.wallet_otp !== wallet_otp) {
      throw new Error("Invalid Otp")
    }
    else {
      await UserModel.updateOne(
        { _id: req.user._id },
        {
          $set: {
            email: email,
          },
        }
      );
      const checkpinotp = await UserModel.findOne({ _id: req.user._id });
      return res.status(200).json({
        status: true,
        message: "Wallet Otp verified successfully",
        respose: checkpinotp,
      })
    }
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    })
  }
};

//*****************************************************************************************************************************/
//reset Wallet Pin Api  //
//****************************************************************************************************************************/

module.exports.changeWalletPin = async (req, res, next) => {
  try {
    const { newPin, confirmPin } = req.body;
    const email = await UserModel.findOne({ _id: req.user._id });
    if (newPin !== confirmPin) {
      throw new Error('New Pin & Confirm Pin Does Not matched')
    }
    await UserModel.updateOne({ _id: req.user._id },
      {
        $set: {
          pin: newPin,
        },
      })
    const updatepin = await UserModel.findOne({ _id: req.user._id });
    return res.status(200).json({
      status: true,
      messaage: "Wallet Pin Reset Successfully",
      response: updatepin,
    })
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    })
  }
};



//*****************************************************************************************************************************/
//update name  Api  //
//****************************************************************************************************************************/

module.exports.updateName = async (req, res, next) => {
  try {

    const { name } = req.body;
    const updatename = await UserModel.findByIdAndUpdate({ _id: req.user._id },
      {
        $set: { name: name }
      }, { new: true })
    return res.status(200).json({
      status: true,
      message: "Updated successfully",
      response: updatename,
    })

  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.messaage,
      stack: err.stack,

    })
  }
}


//*****************************************************************************************************************************/
//update email  Api  //
//****************************************************************************************************************************/

module.exports.updateEmail = async (req, res, next) => {
  try {

    const { email } = req.body;
    const checkemail = await UserModel.findOne({ email: email })
    if (checkemail) throw new Error("email already exits")
    const userData = await UserModel.findOne({ _id: req.user._id })
    const otp = Math.floor(1000 + Math.random() * 9000);
    const data = await UserModel.findByIdAndUpdate(
      { _id: req.user._id },
      {
        $set: {
          email: userData.email,
          email_otp: otp,
        },
      },
      { new: true }
    );
    var transporter = nodemailer.createTransport({
      host: 'abbawallet.com',
      port: 465,
      auth: {
        user: 'noreply@abbawallet.com',
        pass: 'Noreply@ABBA202201',
      }
    });
    const mailOptions = {
      from: "noreply@abbawallet.com",
      to: email,
      subject: 'OTP from ABBA Wallet',
      html: `<div><span>Hello ${data.name}</span>
          <br /><br />
          <span>
            Thank you for choosing ABBA Wallet. As per your request, we are sending you your One-Time Password (OTP) for accessing your account. 
            This OTP is valid for 4 minutes only.
          </span>
          <br /><br />
          <b>${otp}</b>
          <br /><br />
          <span>If you didn’t request this, you can ignore this email.</span>
          <br /><br />
          <span>
            Remember, no one from ABBA Payments Ltd ("ABBA Wallet") will ever contact
            you, either by email or phone, to request your password.
          </span>
          <br /><br />
          <span>
            Regards,<br />
            ABBA Payments Ltd
          </span></div>`,
    };
    if (email) {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log("Otp sent your email:", info.messageId, info.response);
      });
    }

    return res.status(200).json({
      status: true,
      message: "Otp send please your email",
      response: data,
    })
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
      stack: err.stack,
    })
  }
}


//*****************************************************************************************************************************/
//update email  Api  //
//****************************************************************************************************************************/

module.exports.updatePhoneNumber = async (req, res, next) => {
  try {
    const { phoneNumber, countryName, countryCode } = req.body;
    const checkNumber = await UserModel.findOne({ phoneNumber: phoneNumber })
    if (checkNumber) throw new Error("Phone number already exits")
    const userData = await UserModel.findOne({ _id: req.user._id })
    const otp = Math.floor(1000 + Math.random() * 9000);
    const data = await UserModel.findByIdAndUpdate(
      { _id: req.user._id },
      {
        $set: {
          phone_otp: otp,
          phoneNumber: userData.phoneNumber,
        },
      },
      { new: true }
    );
    SendOtp(null, countryCode + phoneNumber, otp, userData.name);
    return res.status(200).json({
      status: true,
      message: "Otp send please your Phone",
      response: data,
    })
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
      stack: err.stack,
    })
  }

}

module.exports.userSubscription = async (req, res, next) => {
  try {
    const { email} = req.body;
     let data=await userSubscriptionModel.create({email})
    return res.status(200).json({
      status: true,
      message: "Message add successfully",
      response: data,
    })
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
      stack: err.stack,
    })
  }

}
module.exports.userContactUs = async (req, res, next) => {
  try {
    const { name , email,messaage} = req.body;
     let data=await userContactModel.create({name,email,messaage})
    return res.status(200).json({
      status: true,
      message: "Message add successfully !",
      response: data,
    })
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
      stack: err.stack,
    })
  }

}