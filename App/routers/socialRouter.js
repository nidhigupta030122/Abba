module.exports = app=>{
    let router =require('express').Router()
    let multer =require('multer')
    var socialControllers  = require("../controller/socialController.js")
    
//Router........................................................................................ 


const storagsss = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'upload');
    },
    filename: function (req, file, cb){
        cb(null, file.originalname);
    }
});
let uploadImages = multer({ storage: storagsss });
     router.post("/SocialRegister",uploadImages.single('file'),socialControllers.Socialsignup);
     router.post("/SocialLogin",socialControllers.socialLogin);
   
    

  
   

app.use('/',router)
}