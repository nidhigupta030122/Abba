module.exports = (app) => {
  let router = require("express").Router();
  var { checkUserAuth } = require("../middlewares/middlewares.js");
  const AdminController = require("../controller/adminController.js")
  const { isAuthenticatedAdmin } = require("../middlewares/middlewares");
  const path=require("path")
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
  router.post('/admin/creteQuestionAnswer',isAuthenticatedAdmin, AdminController.creteQuestionAnswer)
  router.post('/admin/adminsignup', AdminController.adminSignUp)



  router.post('/admin/createSubAdmin', isAuthenticatedAdmin, AdminController.createSubAdmin)
  router.post('/admin/updateSubAdmin', isAuthenticatedAdmin, AdminController.updateSubAdmin)
  router.get('/admin/fetchAllSubAdmin', isAuthenticatedAdmin, AdminController.fetchAllSubAdmin)
  router.post('/admin/fetchSigleSubAdmin', isAuthenticatedAdmin, AdminController.fetchSigleSubAdmin)
  router.post('/admin/deleteSubAdmin', isAuthenticatedAdmin, AdminController.deleteSubAdmin)





  router.get('/admin/getallusers', isAuthenticatedAdmin, AdminController.getAllUsers)
  router.delete('/admin/deleteoneuser/:id', isAuthenticatedAdmin, AdminController.deleteUserById)
  router.get('/admin/getallevents',isAuthenticatedAdmin, AdminController.getAllEventsForAdmin)
  router.get('/admin/geteventsById/:id', isAuthenticatedAdmin, AdminController.viewEventById)
  router.delete('/admin/deleteoneevent/:id', isAuthenticatedAdmin, AdminController.deleteEventById)
  router.get('/admin/getallquestionanswers', AdminController.getAllQuestionAnswers)
  router.get('/admin/getonequestionanswers/:id', isAuthenticatedAdmin, AdminController.getOneQuestionAnswers)
  router.delete('/admin/deletequestionanswer/:id', isAuthenticatedAdmin, AdminController.deleteQuestionAnswerById)
  router.post('/admin/updatequestionanswer', isAuthenticatedAdmin, AdminController.updateQuestionAnswerById)
  // const multer = require("multer");
  // const path=require("path")

  // const storages = multer.diskStorage({
  //   destination: function (req, file, cb) {
  //     // cb(null, "upload");
  //     const uploadFolder = path.join(__dirname, "..","..","upload"); // Update the relative path to the upload folder
  //     cb(null, uploadFolder);
  //   },
  //   filename: function (req, file, cb) {
  //     cb(null, file.fieldname);
  //   },
  // });
  // let uploadImg = multer({ storage: storages });
  /// Update Admin Profile
  router.post('/admin/updateadminprofile', isAuthenticatedAdmin, upload.single("file"), AdminController.updateAdminProfile)
  router.get('/admin/getadminprofile/:id', isAuthenticatedAdmin, AdminController.getAdminProfileById);
  router.get('/admin/getadmin', isAuthenticatedAdmin, AdminController.getAdminProfile);

  /// change password
  router.post('/admin/changePassword', isAuthenticatedAdmin, AdminController.changePassword);

  ////Count API
  router.post('/admin/countapi', isAuthenticatedAdmin, AdminController.countapi);

  /// Fetch Detail 
  router.post('/admin/fetchdetailforAdmin', isAuthenticatedAdmin, AdminController.fetchdetailforAdmin);

  /// Recent Users 
  router.post('/admin/recentusers', isAuthenticatedAdmin, AdminController.recentusers);

  /// List of Deactivated Users 
  router.get('/admin/deactivatedusers', isAuthenticatedAdmin, AdminController.deactivatedusers);

  ///Update Active/Deactivated users
  router.post('/admin/updateusers', isAuthenticatedAdmin, AdminController.updateusers);

  //Mapping Graph For Users ////
  router.post("/admin/mappinggraphinfo", isAuthenticatedAdmin, AdminController.mappinggraphinfo);

  
    //User list
    router.get('/admin/userList',isAuthenticatedAdmin,AdminController.getAllUserList)
    router.get('/admin/userList/:id',isAuthenticatedAdmin,AdminController.getAllUserListById)
    //delete user
    router.delete('/admin/Userdelete/:id',AdminController.deleteUserById)
   
//Admin add on the supporto description
router.post("/admin/addDescription",isAuthenticatedAdmin,AdminController.addDesription)
router.put("/admin/editDescription",isAuthenticatedAdmin,AdminController.editDesription)
router.get("/admin/getAllDescription",isAuthenticatedAdmin,AdminController.getAllDecription)
router.get("/admin/getSingleDescription/:id",isAuthenticatedAdmin,AdminController.getSingleDecription)
router.delete("/admin/deleteDescriptionById/:id",isAuthenticatedAdmin,AdminController.deleteDescriptionById)


router.get("/admin/getAllTransaction",isAuthenticatedAdmin,AdminController.getAllTransation)
router.get("/admin/getAllTransactions/:id",isAuthenticatedAdmin,AdminController.getAllTransationById)
router.get("/admin/getAllFee",AdminController.getAllFee)

//Dashboard api total user, total transation, total events total sub-admin
router.get("/admin/dashboard",AdminController.AdminDashboard)


  app.use("/", router);
};
