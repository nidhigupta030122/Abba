module.exports = app => {
  let router = require('express').Router()
  var eventControllers = require("../controller/eventController.js")
  var { checkUserAuth } = require("../middlewares/middlewares.js")

  //Router........................................................................................ 
  const multer = require('multer')
  const storages = multer.diskStorage({
      destination: function (req, file, cb) {
          cb(null, 'upload');
      },
      filename: function (req, file, cb) {
          cb(null, file.originalname);
      }
  });
  let uploadImg = multer({ storage: storages });
  router.post("/createEvent", checkUserAuth, uploadImg.single('file'), eventControllers.createEvent);
  router.get("/fetchAllEvents", checkUserAuth, eventControllers.fetchAllEvents);
  router.get("/fetchAllEventsByLimit", checkUserAuth, eventControllers.fetchAllEventsByLimit);
  router.get("/fetchSingleEvents", checkUserAuth, eventControllers.fetchSingleEvents);
  router.get("/fetchUserEvents", checkUserAuth, eventControllers.fetchUserEvents);
  router.post("/deleteEvents", checkUserAuth, eventControllers.deleteEvents);
  router.post("/updateEvents", checkUserAuth, eventControllers.updateEvents);
  router.post("/updateEventImage", checkUserAuth, uploadImg.single('file'), eventControllers.updateEventImage);
  router.get("/fetchExpireEvents", checkUserAuth, eventControllers.fetchExpireEvents);

  router.get("/detailsEvent", checkUserAuth, eventControllers.GetEvent);
  router.get("/userList", checkUserAuth, eventControllers.userList);
  router.get("/eventList", checkUserAuth, eventControllers.eventList);
  router.post("/sendRequest", checkUserAuth, eventControllers.sendRequests);
  router.get("/fetchQuestionsAnswers", checkUserAuth, eventControllers.fetchQuestionsAnswers);
  router.post("/searchQuestionsAnswers", checkUserAuth, eventControllers.searchQuestionsAnswers);
  router.get("/fetchnotificationlist", checkUserAuth, eventControllers.fetchnotificationlist);
  router.get("/fetchRequest", checkUserAuth, eventControllers.fetchRequest);
  router.post("/accpetRequest", checkUserAuth, eventControllers.accpetRequest);
  router.post("/rejectedRequest", checkUserAuth, eventControllers.rejectedRequest);
  router.post("/deleteNotification", checkUserAuth, eventControllers.deleteNotification);
  router.post("/readNotificationStatus", checkUserAuth, eventControllers.readNotificationStatus);
  router.get("/getNotificationStatus", checkUserAuth, eventControllers.getNotificationStatus);

  app.use('/', router)
}