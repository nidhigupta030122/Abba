let eventModel = require('../models/eventModel.js')
let userModel = require('../models/userModel.js')
let requestModel = require('../models/userRequestModel.js')
const notificationModel = require("../models/notificationModel");
const userRequestModels = require("../models/userRequestModel.js");
const QuestionModel = require("../models/questionsModel");
var FCM = require('fcm-node');
var serverKey = 'AAAA5a9iCPQ:APA91bGsy7qEkL3Uv70Vn0G4nwUYrg9NA9vYlds36mFzPUb7K0Ps3rLjw8YvFftZkrREEH6WUhViclOHweU9zprXShNStA-Sb8qAX9VjYddv9Qr_y-sgpdgfjiA2bSWAlUZ6WgqR1WZU'; //put your server key here
var fcm = new FCM(serverKey);
const TransactionModel = require("../models/transactionModel");
const moment = require('moment');
var fetch = require("node-fetch");


//*****************************************************************************************************************************/
// CreateEvent  Api   //
//****************************************************************************************************************************/
module.exports.createEvent = async (req, res) => {
  const { title, eventLastDate, description, chooseAmount, showEvent, ToCurrency } = req.body;
  try {
    const { currency } = await userModel.findOne({ _id: req.user._id });
    let amounts = chooseAmount;
    let from = currency;
    let to = 'USD';
    const head = {
      apiKey: "AthhwZmvX4a7uJwk3u6NE44xmCTfjdwS",
    };
    var requestOptions = {
      method: "GET",
      redirect: "follow",
      headers: head,
    };
    await fetch(
      `https://api.apilayer.com/exchangerates_data/convert?to=${to}&from=${from}&amount=${amounts}`,
      {
        headers: head
      }
    ).then((response) => response.json()).then(async (res1) => {
      const data = await eventModel.create({
        userId: req.user._id,
        title: title,
        eventLastDate: eventLastDate,
        description: description,
        chooseAmount: res1.result,
        showEvent: showEvent,
        image: "https://app.abbawallet.com/upload/" + req.file?.filename,
      })
      return res.status(200).json({
        "success": true,
        "Status": "200",
        "message": "The event has been posted successfully.",
        "response": data
      })
    })
  } catch (error) {
    return res.status(401).json({
      "success": false,
      "Status": "401",
      "message": error.message,
    })
  }
}


//*****************************************************************************************************************************/
// Fetch All Events  Api   //
//****************************************************************************************************************************/

module.exports.fetchAllEvents = async (req, res) => {
  try {
    const date = new Date();
    const currentdate = moment(date).format("YYYY-MM-DD");
    const { currency } = await userModel.findOne({ _id: req.user._id });
    const FetchEvents = await eventModel
      .find({ eventLastDate: { $gte: currentdate }, showEvent: true })
      .sort({ createdAt: -1 })
      .populate("userId");
    // ************************************************************* Currency convert *******************************************************************************//

    const updatedData = await Promise.all(
      FetchEvents?.map(async (data) => {
        let amounts = data?.chooseAmount;
        let from = "USD";
        let to = currency;
        const head = {
          apiKey: "AthhwZmvX4a7uJwk3u6NE44xmCTfjdwS",
        };
        var requestOptions = {
          method: "GET",
          redirect: "follow",
          headers: head,
        };
        if (amounts) {
          const response = await fetch(
            `https://api.apilayer.com/exchangerates_data/convert?to=${to}&from=${from}&amount=${amounts}`,
            {
              headers: head,
            }
          );
          const res1 = await response.json();
          // console.log("res1res1res1res1res1res1res1res1res1res1",res1);
          data.currencyAmount = res1.result;
          return data;
        }
      })
    );

    // ************************************************************* Totel Transactions Amount  *******************************************************************************//

    var Transaction = await TransactionModel.find();

    // console.log("TransactionTransactionTransactionTransactionTransaction",Transaction);

    const loggedIds = new Set();

    FetchEvents.forEach((value) => {
      Transaction.forEach((item) => {
        const id = value?._id?.toString();
        // const id = value?._id?.toString() ?? '';
        if (id && !loggedIds.has(id)) {
          const totelAmounts = item?.transactions?.reduce(
            (accumulator, currentValue) => {
              if (currentValue?.event_id?.toString() === id) {
                return accumulator + currentValue?.feeCutAmount;
              } else {
                return accumulator;
              }
            },
            0
          );
          value.percentage = (totelAmounts * 100) / value.chooseAmount;
          value.totelAmount = totelAmounts;
          loggedIds.add(id);
        }
      });
    });









    // const loggedIds = new Set();

    // console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxx",loggedIds)

    // FetchEvents.forEach((value) => {
    //   Transaction.forEach((item) => {
    //     const id = value?._id?.toString();

    //     // console.log('cccccccccccccccccccccccccccccccccccc' ,id)
    //     // console.log('loggedIdsloggedIdsloggedIdsloggedIds' ,loggedIds)


    //     // if (id && !loggedIds.has(id)) {


    //       const totelAmounts = item?.transactions?.reduce((accumulator, currentValue) => {
    //         if (currentValue?.event_id?.toString() === id) {
    //           console.log("currentValuecurrentValuecurrentValue",currentValue)
    //           return accumulator + currentValue?.feeCutAmount;
    //         } else {
    //           return accumulator;
    //         }
    //       }, 0);

    //       console.log("totelAmountstotelAmountstotelAmounts",totelAmounts)
    //       value.totelAmount = totelAmounts;
    //       value.percentage = (totelAmounts * 100) / value.chooseAmount;
    //       // loggedIds.add(id);
    //     // }
    //   });
    // });

    // ************************************************************* Totel Transaction Amount  *******************************************************************************//

    const updated = await Promise?.all(
      FetchEvents?.map(async (data) => {

        // console.log(
        //   "id====================",
        //   data?._id,
        //   "amount================",
        //   data?.totelAmount
        // );

        let amounts = data?.totelAmount;
        let from = "USD";
        let to = currency;
        const head = {
          apiKey: "AthhwZmvX4a7uJwk3u6NE44xmCTfjdwS",
        };
        var requestOptions = {
          method: "GET",
          redirect: "follow",
          headers: head,
        };
        if (amounts) {
          const response = await fetch(
            `https://api.apilayer.com/exchangerates_data/convert?to=${to}&from=${from}&amount=${amounts}`,
            {
              headers: head,
            }
          );
          const res1 = await response.json();
          // console.log("res1res1res1res1res1res1",res1);
          data.totelTransactionAmount = res1.result;
          return data;
        }
      })
    );

    // ************************************************************* Totel Days left  *******************************************************************************//

    FetchEvents.forEach((event) => {
      const currentdata = new Date();
      var a = moment(event.eventLastDate);
      var b = moment(currentdata);
      const daysAgo = a.diff(b, "days");
      event.daysAgo = daysAgo + 1;
    });
    setTimeout(() => {
      return res.status(200).json({
        status: true,
        message: "Events Fetch Successfully",
        Response: FetchEvents,
      });
    }, 2000);
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    });
  }
};


// module.exports.fetchAllEvents = async (req, res) => {
//   try {
//     const date = new Date()
//     const currentdate = moment(date).format('YYYY-MM-DD')
//     const { currency } = await userModel.findOne({ _id: req.user._id })
//     const FetchEvents = await eventModel.find({ eventLastDate: { $gte: currentdate }, showEvent: true }).sort({ createdAt: -1 }).populate("userId");
//     // ************************************************************* Currency convert *******************************************************************************//

//     const updatedData = await Promise.all(FetchEvents?.map(async (data) => {
//       let amounts = data?.chooseAmount;
//       let from = "USD";
//       let to = currency;
//       const head = {
//         apiKey: "03nQOU8EjekZNQa2Hh35LdSs353ZPID2",
//       };
//       var requestOptions = {
//         method: "GET",
//         redirect: "follow",
//         headers: head,
//       };
//       if (amounts) {
//         const response = await fetch(
//           `https://api.apilayer.com/exchangerates_data/convert?to=${to}&from=${from}&amount=${amounts}`,
//           {
//             headers: head
//           }
//         );
//         const res1 = await response.json();
//         data.currencyAmount = res1.result;
//         return data;
//       }
//     }));


//     // ************************************************************* Totel Transactions Amount  *******************************************************************************//

//     var Transaction = await TransactionModel.find({ type: "0" });
//     const loggedIds = new Set();
//     FetchEvents.forEach((value) => {
//       Transaction.forEach((item) => {
//         const id = value?._id?.toString();
//         if (id && !loggedIds.has(id)) {
//           const totelAmounts = item?.transactions?.reduce((accumulator, currentValue) => {
//             if (currentValue?.event_id?.toString() == id) {
//               return accumulator + currentValue?.amount;
//             } else {
//               return accumulator;
//             }
//           }, 0)
//           value.percentage = totelAmounts * 100 / value.chooseAmount;
//           value.totelAmount = totelAmounts;
//           loggedIds.add(id);
//         }
//       })
//     })


//     // ************************************************************* Totel Transaction Amount  *******************************************************************************//


//     const updated = await Promise.all(FetchEvents?.map(async (data) => {
//       let amounts = data?.totelAmount;
//       let from = "USD";
//       let to = currency;
//       const head = {
//         apiKey: "03nQOU8EjekZNQa2Hh35LdSs353ZPID2",
//       };
//       var requestOptions = {
//         method: "GET",
//         redirect: "follow",
//         headers: head,
//       };
//       if (amounts) {
//         const response = await fetch(
//           `https://api.apilayer.com/exchangerates_data/convert?to=${to}&from=${from}&amount=${amounts}`,
//           {
//             headers: head
//           }
//         );
//         const res1 = await response.json();
//         data.totelTransactionAmount = res1.result;
//         return data;
//       }
//     }));

//     // ************************************************************* Totel Days left  *******************************************************************************//

//     FetchEvents.forEach(event => {
//       const currentdata = new Date()
//       var a = moment(event.eventLastDate);
//       var b = moment(currentdata);
//       const daysAgo = a.diff(b, 'days');
//       event.daysAgo = daysAgo + 1;
//     });
//     setTimeout(() => {
//       return res.status(200).json({
//         status: true,
//         message: "Events Fetch Successfully",
//         Response: FetchEvents,
//       })
//     }, 2000);
//   } catch (err) {
//     return res.status(401).json({
//       status: false,
//       message: err.message,
//     })
//   }
// };//*****************************************************************************************************************************/
// Fetch All Events by Limit  Api   //
//****************************************************************************************************************************/

module.exports.fetchAllEventsByLimit = async (req, res) => {
  try {

    const date = new Date()
    const currentdate = moment(date).format('YYYY-MM-DD')
    const { currency } = await userModel.findOne({ _id: req.user._id })
    const FetchEvents = await eventModel.find({ eventLastDate: { $gte: currentdate }, showEvent: true }).populate({
      path: "userId",
      select: "name profile",
    }).limit(7).sort({ createdAt: -1 });
    const Transaction = await TransactionModel.find();
    // ************************************************************* Currency convert *******************************************************************************//
    const updatedData = await Promise.all(FetchEvents?.map(async (data) => {
      let amounts = data?.chooseAmount;
      let from = "USD";
      let to = currency;
      const head = {
        apiKey: "AthhwZmvX4a7uJwk3u6NE44xmCTfjdwS",
      };
      var requestOptions = {
        method: "GET",
        redirect: "follow",
        headers: head,
      };
      if (amounts) {
        const response = await fetch(
          `https://api.apilayer.com/exchangerates_data/convert?to=${to}&from=${from}&amount=${amounts}`,
          {
            headers: head
          }
        );
        const res1 = await response.json();
        data.currencyAmount = res1.result;
        return data;
      }
    }));
    // ************************************************************* Total Transactions Amount  *******************************************************************************//
    // const loggedIds = new Set();
    // FetchEvents.forEach(async (value) => {
    //   Transaction.forEach(async (item) => {
    //     const id = value?._id?.toString();
    //     if (id && !loggedIds.has(id)) {
    //       const totelAmounts = await item?.transactions.reduce(
    //         (accumulator, currentValue) => {
    //           if (currentValue?.event_id?.toString() === id) {
    //             return accumulator + currentValue?.feeCutAmount;
    //           } else {
    //             return accumulator;
    //           }
    //         },
    //         0
    //       );
    //       value.totelAmount = totelAmounts;
    //       value.percentage = totelAmounts * 100 / value.chooseAmount;
    //       loggedIds.add(id);
    //     }
    //   });
    // });

    const totalAmount = {};
    FetchEvents.forEach(async (item) => {
      const fetchdata = Transaction.filter((value) => value.transactions.some((v) => v.event_id?.toString() === item._id.toString()));
      const eventTotalAmount =  fetchdata.reduce((accumulator, currentValue) => {
        currentValue.transactions.forEach((transaction) => {
          if(transaction.event_id.toString() === item._id.toString())
          {
            accumulator += transaction.feeCutAmount;
          }
        });
        return accumulator;
      }, 0);
      totalAmount[item._id.toString()] = eventTotalAmount;
      item.totelAmount = eventTotalAmount;
      item.percentage = eventTotalAmount * 100 / item.chooseAmount;

    });










    // ************************************************************* Totel Transaction Amount  *******************************************************************************/
    const updated = await Promise.all(FetchEvents?.map(async (data) => {
      let amounts = data?.totelAmount;
      let from = "USD";
      let to = currency;
      const head = {
        apiKey: "AthhwZmvX4a7uJwk3u6NE44xmCTfjdwS",
      };
      var requestOptions = {
        method: "GET",
        redirect: "follow",
        headers: head,
      };
      if (amounts) {
        const response = await fetch(
          `https://api.apilayer.com/exchangerates_data/convert?to=${to}&from=${from}&amount=${amounts}`,
          {
            headers: head
          }
        );
        const res1 = await response.json();
        data.totelTransactionAmount = res1.result;
        return data;
      }
    }));

    // ************************************************************* Totel Days left  *******************************************************************************//
    FetchEvents.forEach((event) => {
      const currentdata = new Date()
      var a = moment(event.eventLastDate);
      var b = moment(currentdata);
      const daysAgo = a.diff(b, 'days');
      event.daysAgo = daysAgo + 1;
    })
    return res.status(200).json({
      status: true,
      message: "Events Fetch Successfully",
      Response: FetchEvents,
    });
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    });
  }
};
//*****************************************************************************************************************************/
// Fetch Single Events  Api   //
//****************************************************************************************************************************/

module.exports.fetchSingleEvents = async (req, res) => {
  try {
    const { currency } = await userModel.findOne({ _id: req.user._id })
    const singleEvent = await eventModel.findById({ _id: req.query._id }).populate("userId");
    let amounts = singleEvent.chooseAmount;

    let from = "USD";
    let to = currency;
    const head = {
      apiKey: "AthhwZmvX4a7uJwk3u6NE44xmCTfjdwS",
    };

    var requestOptions = {
      method: "GET",
      redirect: "follow",
      headers: head,
    };
    await fetch(
      `https://api.apilayer.com/exchangerates_data/convert?to=${to}&from=${from}&amount=${amounts}`,
      {
        headers: head
      }
    )
      .then((response) => response.json()).then(async (res1) => {
        var Transactions = await TransactionModel.find().populate(
          {
            path: "transactions.payeer_id",
            select: "_id profile name",
          }
        );
        const totelAmount = [];
        const data = [];
        Transactions.forEach((value) => {
          var fetchdata = value?.transactions?.filter((v) => v?.event_id?.toString() === req.query._id.toString())
          fetchdata?.map((val) => {
            totelAmount.push(val?.feeCutAmount)
            data.push(val)
          })

        })

        // var Transaction = await TransactionModel.findOne({ user_id: req.user._id }).populate(
        //   {
        //     path: "transactions.payeer_id",
        //     select: "_id profile name",
        //   }
        // );
        // const data = Transaction?.transactions?.filter((v) => v?.event_id?.toString() === req.query._id.toString())
        // console.log("datadatadatadatadatadatadata", data)

        // data?.map((val) => {
        //   totelAmount.push(val?.feeCutAmount)

        // })

        const initialValue = 0;
        const totelAmounts = totelAmount.reduce(
          (accumulator, currentValue) => accumulator + currentValue,
          initialValue
        );

        const currencyAmount = res1.result
        const percentage = totelAmounts * 100 / singleEvent.chooseAmount;

        let amounts = totelAmounts;
        let from = "USD";
        let to = currency;
        const head = {
          apiKey: "AthhwZmvX4a7uJwk3u6NE44xmCTfjdwS",
        };
        var requestOptions = {
          method: "GET",
          redirect: "follow",
          headers: head,
        };
        await fetch(
          `https://api.apilayer.com/exchangerates_data/convert?to=${to}&from=${from}&amount=${amounts}`,
          {
            headers: head
          }
        )
          .then((response) => response.json()).then(async (res1) => {
            return res.status(200).json({
              status: true,
              message: "Single Event Fetch Successfully",
              response: singleEvent,
              event_user: data,
              totelAmount: totelAmounts?.toString(),
              totelTransactionAmount: res1.result?.toString(),
              percentage: percentage?.toString(),
              currencyAmount: currencyAmount?.toString(),
            });
          })
      })
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
      stack: err.stack,
    });
  }
};

//*****************************************************************************************************************************/
// Fetch Login User Events  Api   //
//****************************************************************************************************************************/

module.exports.fetchUserEvents = async (req, res, next) => {
  try {
    const date = new Date()
    const currentdate = moment(date).format('YYYY-MM-DD')

    const fetchuser_evnt = await eventModel.find({ userId: req.user._id, eventLastDate: { $gte: currentdate } }).sort({ createdAt: -1 }).populate("userId");
    var Transaction = await TransactionModel.find({ user_id: req.user._id });
    const { currency } = await userModel.findOne({ _id: req.user._id })
    const updatedData = await Promise.all(fetchuser_evnt?.map(async (data) => {
      let amounts = data?.chooseAmount;
      let from = "USD";
      let to = currency;
      const head = {
        apiKey: "AthhwZmvX4a7uJwk3u6NE44xmCTfjdwS",
      };
      var requestOptions = {
        method: "GET",
        redirect: "follow",
        headers: head,
      };
      if (amounts) {
        const response = await fetch(
          `https://api.apilayer.com/exchangerates_data/convert?to=${to}&from=${from}&amount=${amounts}`,
          {
            headers: head
          }
        );
        const res1 = await response.json();
        data.currencyAmount = res1.result;
        return data;
      }
    }));
    const loggedIds = new Set();
    fetchuser_evnt.forEach((value) => {
      Transaction.forEach((item) => {
        const id = value?._id?.toString();
        if (id && !loggedIds.has(id)) {
          const totelAmounts = item?.transactions.reduce(
            (accumulator, currentValue) => {
              if (currentValue?.event_id?.toString() === id.toString()) {
                return accumulator + currentValue?.feeCutAmount;
              } else {
                return accumulator;
              }
            },
            0
          );
          value.totelAmount = totelAmounts;
          value.percentage = totelAmounts * 100 / value.chooseAmount;
          loggedIds.add(id);
        }
      });
    });

    // ************************************************************* Totel Transaction Amount  *******************************************************************************//


    const updated = await Promise.all(fetchuser_evnt?.map(async (data) => {
      let amounts = data?.totelAmount;
      let from = "USD";
      let to = currency;
      const head = {
        apiKey: "AthhwZmvX4a7uJwk3u6NE44xmCTfjdwS",
      };
      var requestOptions = {
        method: "GET",
        redirect: "follow",
        headers: head,
      };
      if (amounts) {
        const response = await fetch(
          `https://api.apilayer.com/exchangerates_data/convert?to=${to}&from=${from}&amount=${amounts}`,
          {
            headers: head
          }
        );
        const res1 = await response.json();
        data.totelTransactionAmount = res1.result;
        return data;
      }
    }));


    fetchuser_evnt.forEach((event) => {
      const currentdata = new Date()
      var a = moment(event.eventLastDate);
      var b = moment(currentdata);
      const daysAgo = a.diff(b, 'days');
      event.daysAgo = daysAgo + 1;
    })

    return res.status(200).json({
      status: true,
      message: "Event Fetch successfully",
      response: fetchuser_evnt,
    })

  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    })
  }
}//*****************************************************************************************************************************/
// Delete Events  Api   //
//****************************************************************************************************************************/

module.exports.deleteEvents = async (req, res) => {
  try {
    const deleteEvents = await eventModel.findByIdAndDelete({ _id: req.body.event_id, userId: req.user._id })
    return res.status(200).json({
      status: true,
      message: "Event Delete Successfully",
    })
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    })
  }
}

//*****************************************************************************************************************************/
// update Events  Api   //
//****************************************************************************************************************************/
module.exports.updateEvents = async (req, res, next) => {
  try {
    const { event_id, title, eventLastDate, description, chooseAmount, showEvent } = req.body;
    const event_data = await eventModel.findOne({ _id: event_id, userId: req.user._id });
    const { currency } = await userModel.findOne({ _id: req.user._id });
    let amounts = parseInt(chooseAmount);
    let from = currency;
    let to = 'USD';
    const head = {
      apiKey: "AthhwZmvX4a7uJwk3u6NE44xmCTfjdwS",
    };
    var requestOptions = {
      method: "GET",
      redirect: "follow",
      headers: head,
    };
    fetch(
      `https://api.apilayer.com/exchangerates_data/convert?to=${to}&from=${from}&amount=${amounts}`,
      {
        headers: head
      }
    ).then((response) => response.json()).then(async (res1) => {
      const data = await eventModel.findByIdAndUpdate({ _id: event_id, userId: req.user._id },
        {
          $set:
          {
            title: title ? title : event_data.title,
            eventLastDate: eventLastDate ? eventLastDate : event_data.eventLastDate,
            description: description ? description : event_data.description,
            chooseAmount: res1.result,
            showEvent: showEvent ? showEvent : event_data.showEvent,
          },
        },
        { new: true }
      );
      const fetchdata = await eventModel.findOne({ _id: event_id, userId: req.user._id });
      return res.status(200).json({
        status: true,
        message: "Event Update successfully",
        response: fetchdata,
      })
    })
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    })
  }
};
//*****************************************************************************************************************************/
//detailsEvent  Api   //
//****************************************************************************************************************************/

module.exports.GetEvent = async (req, res) => {
  const { _id } = req.query
  try {
    const data = await eventModel.find({ _id: _id })
    if (data) {
      res.status(200).send({ "success": true, "status": "200", "message": "Get Event Details Succesfully", data })
    } else {
      res.status(401).send({ "status": "failed", "message": "Something Went Wrong" })
    }
  } catch (err) {
    res.status(401).send({ "status": "failed", "message": "Something Went Wrong" })
    console.log("error", err);
  }
}

//listUser..........................................................

module.exports.userList = async (req, res) => {
  try {
    const data = await userModel.find()
    if (data) {
      res.status(200).send({ "success": true, "status": "200", "message": "Get User List Succesfully", data })
    } else {
      res.status(401).send({ "status": "failed", "message": "Something Went Wrong" })
    }
  } catch (err) {
    res.status(401).send({ "status": "failed", "message": "Something Went Wrong" })
    console.log("error", err);
  }
}
//listEvents.....................................................

module.exports.eventList = async (req, res) => {
  try {
    const data = await eventModel.find()
    if (data) {
      res.status(200).send({ "success": true, "status": "200", "message": "Get Event  List Succesfully", data })
    } else {
      res.status(401).send({ "status": "failed", "message": "Something Went Wrong" })
    }
  } catch (err) {
    res.status(401).send({ "status": "failed", "message": "Something Went Wrong" })
    console.log("error", err);
  }
}
//sendRequest....................................................
module.exports.sendRequests = (async (req, res) => {
  try {
    let { eventId, usersId } = req.body;
    console.log("usersIdusersIdusersIdusersId", usersId)

    const userData = usersId.split(",");

    const fetchuser = await userModel.findOne({ _id: req.user._id })
    const fetchevent = await eventModel.findOne({ _id: eventId })
    let result = userData?.map(async (user) => {
      let data = await userRequestModels.create({
        userId: user,
        eventId,
        senderId: req.user._id,
        status: "pending",
      });

      const notification = await notificationModel.create({
        user_id: user,
        invitation_id: data._id,
        event_id: eventId,
        title: 'event request',
        description: `name:${fetchuser.name} has sent invitations for event:${fetchevent.title}`,
        status: "event_invitations",
      });
      return data ? true : false;
    });
    if (result.includes(false)) {
      throw new Error("Something went wrong");
    }

    //
    userData.map(async (user) => {
      const userToken = await userModel.findOne({ _id: user })
      var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
        to: userToken.mobile_token,
        notification: {
          title: 'event request',
          body: `name:${fetchuser.name} has sent invitations for event:${fetchevent.title}`
        },
        data: {  //you can send only notification or only data(or include both)
          my_key: 'my value',
          my_another_key: 'my another value'
        }
      };
      fcm.send(message, function (err, response) {
        if (err) {
          console.log("Something has gone wrong!");
        } else {
          console.log("Successfully sent with response: ", response);
        }
      });
    });
    res.status(200).send({
      status: true,
      message: "requests has been made successfully",
    });
  } catch (error) {
    return res.status(401).json({
      status: false,
      message: error.message,
      stack: error.stack,
    });
  }
});//updateShowEvent


//list Questions and Answer.....
module.exports.fetchQuestionsAnswers = async (req, res) => {
  try {
    const data = await QuestionModel.find().limit(10).sort({ createdAt: -1 });
    if (data) {
      res.status(200).send({
        success: true,
        status: "200",
        message: "Questions and Answer fetched successfully",
        response: data,
      });
    } else {
      res
        .status(401)
        .send({ status: "failed", message: "Something Went Wrong" });
    }
  } catch (err) {
    res.status(401).send({ status: "failed", message: "Something Went Wrong" });
    console.log("error", err);
  }
};


//search Questions and Answer.....
module.exports.searchQuestionsAnswers = async (req, res) => {
  try {
    if (Object.entries(req.query.keyword).length === 0) {
      res.status(401).send({ status: "failed", message: "record not found" });
    } else {
      const serach = await QuestionModel.find({ questions: { $regex: req.query.keyword, $options: 'i' } })
      return res.status(200).json({
        status: true,
        message: "Questions and Answer fetched successfully",
        response: serach,
      });
    }
  } catch (err) {
    res.status(401).send({ status: "failed", message: "Something Went Wrong" });
    console.log("error", err);
  }
};



//list notification .....
module.exports.fetchnotificationlist = async (req, res) => {
  try {
    const data = await notificationModel.find({ user_id: req.user._id }).sort({ createdAt: -1 });
    data.map((item) => {
      let result1 = item;
      const now = moment();
      const diffSeconds = now.diff(item.createdAt, 'seconds');
      const diffMinutes = now.diff(item.createdAt, 'minutes');
      const diffHours = now.diff(item.createdAt, 'hours');
      const diffDays = now.diff(item.createdAt, 'days');
      const diffMonths = now.diff(item.createdAt, 'months');
      const diffYears = now.diff(item.createdAt, 'years');

      if (diffSeconds < 60) {
        result1.daysAgo = `${diffSeconds} seconds ago`;
      } else if (diffMinutes < 60) {
        result1.daysAgo = `${diffMinutes} minutes ago`;
      } else if (diffHours < 24) {
        result1.daysAgo = `${diffHours} hours ago`;
      } else if (diffDays < 31) {
        if (diffDays === 1) {
          result1.daysAgo = `1 day ago`;
        } else {
          result1.daysAgo = `${diffDays} days ago`;
        }
      } else if (diffMonths < 12) {
        if (diffMonths === 1) {
          result1.daysAgo = `1 month ago`;
        } else {
          result1.daysAgo = `${diffMonths} months ago`;
        }
      } else {
        if (diffYears === 1) {
          result1.daysAgo = `1 year ago`;
        } else {
          result1.daysAgo = `${diffYears} years ago`;
        }
      }

      console.log("+++++++++++++++++++++++++++", result1);
      return result1;
    });
    if (data) {
      res.status(200).send({
        success: true,
        status: "200",
        message: "Fetch notification list successfully",
        response: data,
      });
    } else {
      res
        .status(401)
        .send({ status: "failed", message: "Something Went Wrong" });
    }
  } catch (err) {
    res.status(401).send({ status: "failed", message: "Something Went Wrong" });
    console.log("error", err);
  }
};


//delete notification .....
module.exports.deleteNotification = async (req, res) => {
  try {
    const data = await notificationModel.findByIdAndDelete({ _id: req.body._id });
    if (data) {
      res.status(200).send({
        success: true,
        status: "200",
        message: "Notification deleted successfully",
      });
    } else {
      res
        .status(401)
        .send({ status: "failed", message: "Something Went Wrong" });
    }
  } catch (err) {
    res.status(401).send({ status: "failed", message: "Something Went Wrong" });
    console.log("error", err);
  }
};

//fetch Request ......`

module.exports.fetchRequest = async (req, res) => {
  try {
    const data = await userRequestModels.find({ userId: req.user._id, status: "pending" }).sort({ createdAt: -1 });
    if (data) {
      res.status(200).send({
        success: true,
        status: "200",
        message: "Request fetched successfully",
        response: data,
      });
    } else {
      res
        .status(401)
        .send({ status: "failed", message: "Something Went Wrong" });
    }
  } catch (err) {
    res.status(401).send({ status: "failed", message: "Something Went Wrong" });
    console.log("error", err);
  }
};


//accpet Request ......`

module.exports.accpetRequest = async (req, res) => {
  try {
    const { request_id } = req.body;
    const accpetRequest = await userRequestModels.findByIdAndUpdate({ _id: request_id }, {
      $set: {
        status: "accepted"
      }
    }, { new: true });
    const fetchsenderuser = await userModel.findOne({ _id: accpetRequest.senderId })
    const fetchreciveruser = await userModel.findOne({ _id: accpetRequest.userId })


    const notification = await notificationModel.create({
      user_id: fetchsenderuser._id,
      title: 'Request accepted',
      description: `your request was accepted by ${fetchreciveruser.name}`,
      status: "request_accepted",
    })


    var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
      to: fetchsenderuser.mobile_token,
      notification: {
        title: 'Request accepted',
        body: `your request was accepted by ${fetchreciveruser.name}`
      },
      data: {  //you can send only notification or only data(or include both)
        my_key: 'my value',
        my_another_key: 'my another value'
      }
    };
    fcm.send(message, function (err, response) {
      if (err) {
        console.log("Something has gone wrong!");
      } else {
        console.log("Successfully sent with response: ", response);
      }
    });



    return res.status(200).json({
      status: true,
      message: "Request accepted successfully",
      response: accpetRequest,
    })



  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
      stack: err.stack,
    })
  }
};


//Rejected Request ......`

module.exports.rejectedRequest = async (req, res) => {
  try {
    const { request_id } = req.body;
    const rejectedRequest = await userRequestModels.findByIdAndUpdate({ _id: request_id }, {
      $set: {
        status: "rejected"
      }
    }, { new: true });
    const fetchsenderuser = await userModel.findOne({ _id: rejectedRequest.senderId })
    const fetchreciveruser = await userModel.findOne({ _id: rejectedRequest.userId })


    var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
      to: fetchsenderuser.mobile_token,
      notification: {
        title: 'Request rejected',
        body: `your Request was rejected by ${fetchreciveruser.name}`
      },
      data: {  //you can send only notification or only data(or include both)
        my_key: 'my value',
        my_another_key: 'my another value'
      }
    };
    fcm.send(message, function (err, response) {
      if (err) {
        console.log("Something has gone wrong!");
      } else {
        console.log("Successfully sent with response: ", response);
      }
    });

    return res.status(200).json({
      status: true,
      message: "Request rejected successfully",
      response: rejectedRequest,
    })

  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
      stack: err.stack,
    })
  }
};

//*****************************************************************************************************************************/
//Update Event Image  Api  //
//****************************************************************************************************************************/
module.exports.updateEventImage = async (req, res) => {
  try {
    const { event_id, title, eventLastDate, description, chooseAmount, showEvent } = req.body;
    const event_data = await eventModel.findOne({ _id: event_id, userId: req.user._id });
    await eventModel.findByIdAndUpdate({ _id: event_id, userId: req.user._id },
      {
        $set:
        {
          title: title ? title : event_data.title,
          eventLastDate: eventLastDate ? eventLastDate : event_data.eventLastDate,
          description: description ? description : event_data.description,
          chooseAmount: chooseAmount ? chooseAmount : event_data.chooseAmount,
          showEvent: showEvent ? showEvent : event_data.showEvent,
          image: "https://app.abbawallet.com/upload/" + req.file?.filename
            ? "https://app.abbawallet.com/upload/" + req.file?.filename
            : "https://app.abbawallet.com/upload/" + event_data.image
        },
      },
      { new: true }
    );
    const fetchdata = await eventModel.findOne({ _id: event_id, userId: req.user._id });

    return res.status(200).json({
      status: true,
      message: "Event Update successfully",
      response: fetchdata,
    })
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    })
  }
};


////Fetch Expired Events
module.exports.fetchExpireEvents = async (req, res) => {
  try {
    const FetchEvents = await eventModel.find({
      eventLastDate: {
        $lte: moment(Date.now() - 24 * 3600 * 1000).format(
          "YYYY-MM-DD"
        ),
      },
    }).populate("userId");
    var Transaction = await TransactionModel.find();
    const { currency } = await userModel.findOne({ _id: req.user._id })

    // ************************************************************* Currency convert *******************************************************************************//
    const updatedData = await Promise.all(FetchEvents?.map(async (data) => {
      let amounts = data?.chooseAmount;
      let from = "USD";
      let to = currency;
      const head = {
        apiKey: "AthhwZmvX4a7uJwk3u6NE44xmCTfjdwS",
      };
      var requestOptions = {
        method: "GET",
        redirect: "follow",
        headers: head,
      };
      if (amounts) {
        const response = await fetch(
          `https://api.apilayer.com/exchangerates_data/convert?to=${to}&from=${from}&amount=${amounts}`,
          {
            headers: head
          }
        );
        const res1 = await response.json();
        data.currencyAmount = res1.result;
        return data;
      }
    }));





    // ************************************************************* Totel Transactions Amount  *******************************************************************************//

    const totalAmount = {};
    FetchEvents.forEach(async (item) => {
      const fetchdata = Transaction.filter((value) => value.transactions.some((v) => v.event_id.toString() === item._id.toString()));
      const eventTotalAmount =  fetchdata.reduce((accumulator, currentValue) => {
        currentValue.transactions.forEach((transaction) => {
          if(transaction.event_id.toString() === item._id.toString())
          {
            console.log("transaction.feeCutAmounttransaction.feeCutAmounttransaction.feeCutAmount0",transaction.feeCutAmount)
            accumulator += transaction.feeCutAmount;
          }
        });
        return accumulator;
      }, 0);
      console.log("eventTotalAmounteventTotalAmounteventTotalAmount",eventTotalAmount)
      totalAmount[item._id.toString()] = eventTotalAmount;
      item.totelAmount = eventTotalAmount;
      item.percentage = eventTotalAmount * 100 / item.chooseAmount;

    });
    // ************************************************************* Totel Transaction Amount  *******************************************************************************//
    const updated = await Promise.all(FetchEvents?.map(async (data) => {
      let amounts = data?.totelAmount;
      let from = "USD";
      let to = currency;
      const head = {
        apiKey: "AthhwZmvX4a7uJwk3u6NE44xmCTfjdwS",
      };
      var requestOptions = {
        method: "GET",
        redirect: "follow",
        headers: head,
      };
      if (amounts) {
        const response = await fetch(
          `https://api.apilayer.com/exchangerates_data/convert?to=${to}&from=${from}&amount=${amounts}`,
          {
            headers: head
          }
        );
        const res1 = await response.json();
        data.totelTransactionAmount = res1.result;
        return data;
      }
    }));
    return res.status(200).json({
      message: "Events Expired",
      status: true,
      response: FetchEvents,
    });
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    })
  }
};

// *********************** Read Notification Status **********************************//
module.exports.readNotificationStatus = async (req, res, next) => {
  try {
    const user = await notificationModel.find({ user_id: req.user._id });
    user.map(async (notification, index) => {
      if (notification.read_status == "false") {
        await notificationModel.findByIdAndUpdate(
          { _id: notification._id },
          {
            $set: {
              read_status: true,
            },
          },
          { new: true }
        );
      }
    })
    const notification = await notificationModel.find({ user_id: req.user._id });
    console.log("notification=======>,", notification);
    return res.status(200).json({
      status: true,
      message: "Notification Status Updated Successfully",
      response: notification,
    });
  } catch (error) {
    console.log(error)
    return res.status(401).json({
      status: false,
      message: error.message,
      stack: error.stack,
    });
  }
};

// *********************** Fetch Notification Status **********************************//
module.exports.getNotificationStatus = async (req, res, next) => {
  try {
    const getStatus = await notificationModel.find({ user_id: req.user._id });
    const checkstatus = getStatus.reduce((accumulator, currentValue) => {
      if (currentValue.read_status == "false") {
        return accumulator + 1;
      }
      else {
        return accumulator + 0;
      }

    }, 0);

    return res.status(200).json({
      status: true,
      message: "Fetch Notification Status successfully",
      data: checkstatus.toString(),
    });
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    });
  }
};