module.exports = app => {
  let router = require('express').Router()
  var { checkUserAuth } = require("../middlewares/middlewares.js")
  const ContactController = require("../controller/contactController");
  router.post("/createContact",checkUserAuth,ContactController.createContact)
  router.post("/fetchAllContact",checkUserAuth,ContactController.fetchAllContact)
  router.post("/searchContactNumber",checkUserAuth,ContactController.searchContactNumber)
  router.post("/searchName",checkUserAuth,ContactController.searchName)
  router.get("/fetchRealcontact",checkUserAuth,ContactController.fetchRealcontact)
  router.post("/contactEmail",checkUserAuth,ContactController.contactEmail);
  router.get("/fetchcontactdetail",checkUserAuth,ContactController.fetchcontactdetail);
  router.post("/contactusaction",checkUserAuth,ContactController.contactusaction);
  app.use('/', router)
}