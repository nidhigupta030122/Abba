module.exports = app => {
  let router = require('express').Router()
  var { checkUserAuth } = require("../middlewares/middlewares.js")
  var AddCardController = require("../controller/addCardController");
  router.post("/addCard", checkUserAuth, AddCardController.addCard);
  router.get("/fetchUserCard", checkUserAuth, AddCardController.fetchUserCard);
  router.post("/fetchSingleCard", checkUserAuth, AddCardController.fetchSingleCard);
  router.post("/deleteCard", checkUserAuth, AddCardController.deleteCard);
  router.post("/updateCard", checkUserAuth, AddCardController.updateCard);




  app.use('/', router)
}