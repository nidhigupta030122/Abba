module.exports = app=>{
  let router =require('express').Router()
  var userControllers  = require("../controller/userController.js")
  var {checkUserAuth}  = require("../middlewares/middlewares.js")
  const multer = require("multer")
  var aws = require("aws-sdk"),
   multerS3 = require("multer-s3");
 aws.config.update({
    accessKeyId: "AKIASWKZDQ4PG4WOYOHG",
    secretAccessKey: "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",
    Region: "us-east-2",
});
s3 = new aws.S3();
upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: "abbawallet-image",
        key: function (req, file, cb) {
            cb(null, "upload/" + Date.now() + file.originalname); //use Date.now() for unique file keys
        },
    }),
});
  
//Router........................................................................................  
//auth.......................
// router.post("/updateProfile",checkUserAuth);
router.get("/getProfile",checkUserAuth);
router.post("/SetPaasword",checkUserAuth);
router.post("/changePassword",checkUserAuth);
router.post("/googleLogin", userControllers.googleLogin);
 router.post("/addPhoneNumber", checkUserAuth, userControllers.addPhoneNumber);


   router.post("/Register",userControllers.signup);
   router.post("/MailVerifyOtp",userControllers.SignUpverifyOtp);
   router.post("/addQuestionAns",userControllers.addQuestionAns);
   router.post("/verifyQusetionAns",userControllers.verifyQusetionAns);
   router.post("/sendPhoneOtp", userControllers.sendPhoneOtp);
   router.post("/verifyPhoneOtp", userControllers.verifyPhoneOtp);
   router.post("/createPin",checkUserAuth,userControllers.createPin);
   router.post("/user/changePin",checkUserAuth,userControllers.changePin);
    router.post("/user/confirmPin", checkUserAuth, userControllers.confrimPin);
    router.get("/deactivateUser", checkUserAuth, userControllers.deactiveUser);
      router.post("/addCurrency", checkUserAuth, userControllers.addCurrency);


   router.get("/sendSmsPhone",userControllers.sendSms);
   router.post("/VerifyPhoneNumber",userControllers.verifyOtpPhoneNumber);
   router.post("/Login",userControllers.Login);
   router.post("/fetchUser",userControllers.fetchUser);
   //update...................
  //  const multer = require('multer')
  //  const storages = multer.diskStorage({
  //     destination: function (req, file, cb) {
  //         cb(null, 'upload');
  //     },
  //     filename: function (req, file, cb) {
  //         cb(null, file.originalname);
  //     }
  // });
  // let uploadImg = multer({ storage: storages });
   router.post("/updateProfile", checkUserAuth,userControllers.updateProfile);
     router.post(
  "/updateProfileImages",
  checkUserAuth, 
  upload.single("file"),
  userControllers.updateProfileImages
);

   
   router.get("/fetchProfile",checkUserAuth,userControllers.fetchProfile);
   router.post("/forgotPassword",userControllers.forgetPassword);
   router.post("/forgotverifyOtp",userControllers.forgotVerifyOtp);
   router.post("/resentOtp",userControllers.resentOtp);
   router.post("/resetPassword",userControllers.resetPassword);



   router.post("/changePassword",userControllers.changePassword);
   router.post("/qrCodeGenerate",checkUserAuth, userControllers.qrCode);
   router.post("/addBankDetails",userControllers.addBankDetail);
   router.get("/getBankDetails",userControllers.getBankDetails);
   router.post("/updateBankDetails",userControllers.addBankDetail);

   router.post("/CheckQrCode",checkUserAuth, userControllers.CheckQrCode);

  ///Fetch Single User
  router.post("/fetchSingleUser", userControllers.fetchSingleUser);
    
  ///////Users Transactions API
  router.post("/userTransaction",checkUserAuth,userControllers.userTransaction);
  
  ///////Verify Email OTP
  router.post("/verifyemailotp",checkUserAuth,userControllers.verifyemailotp);
  
  ///////Activate User Account
  router.get("/activateuseraccount",checkUserAuth,userControllers.activateuseraccount);
  /// Forgot Wallet Pin
  router.post("/forgotWalletPin", checkUserAuth, userControllers.forgotWalletPin);
  router.post("/forgotWalletPinOtp",checkUserAuth, userControllers.forgotWalletPinOtp);
  router.post("/changeWalletPin", checkUserAuth, userControllers.changeWalletPin);
  
 
  router.post("/updateName", checkUserAuth, userControllers.updateName);
  router.post("/updateEmail", checkUserAuth, userControllers.updateEmail);

  router.post("/updatePhoneNumber", checkUserAuth, userControllers.updatePhoneNumber);


  //UserSubscription
  router.post("/userSubscription", userControllers.userSubscription);
  router.post("/userContactUs", userControllers.userContactUs);

app.use('/',router)
}