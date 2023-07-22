const userModels = require("../models/userModel.js");
const WalletModel = require("../models/walletModel.js");
const eventWalletModel= require("../models/eventWalletModel.js")
const { stripe } = require("../../server.js");
var fetch = require("node-fetch");

///////Create Wallet 
module.exports.createWallet = async (req, res) => {
  try {
    const { _id } = req.user;
    const check = await WalletModel.findOne({ user_id: _id });

    // checking if user have wallet created or not if not then will will create one
    if (!check) {
      const user = await userModels.findOne({ _id });
      const result = await WalletModel.create({
        user_id: _id,
      });
      res.status(201).send({
        status: true,
        message: "wallet created successfully",
        response: result,
      });
    } 
    else {
     const { _id } = req.user;
      const { currency } = await userModels.findOne({ _id: req.user._id })

      const results = await WalletModel.findOne({ user_id: _id });
       console.log("resultresultresultresult",results);
      let amounts = results?.balance;
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

      if (amounts != 0) {
              console.log("amountsamountsamountsamounts",amounts);

         const response = await fetch(
            `https://api.apilayer.com/exchangerates_data/convert?to=${to}&from=${from}&amount=${amounts}`,
            {
              headers: head,
            }
          );
        const res1 = await response.json();
        results.convert_balance = res1.result;
        return res.status(200).send({
          status: true,
          message: "wallet fetched successfully",
          response: results,
        });
      } else {
          return res.status(200).send({
          status: true,
          message: "wallet fetched successfully",
          response: results,
        });
      }
    }
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
      stack: err.stack,
    });
  }
};


///////Fetch Wallet 
module.exports.fetchWallet = async (req, res) => {
  try {
    const { _id } = req.user;
    const { currency } = await userModels.findOne({ _id: req.user._id })
    const result = await WalletModel.findOne({ user_id: _id });
    let amounts = result?.balance;
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
    if (amounts !=0) {
      const response = await fetch(
        `https://api.apilayer.com/exchangerates_data/convert?to=${to}&from=${from}&amount=${amounts}`,
        {
          headers: head
        }
      );
      const res1 = await response.json();
      result.convert_balance = res1.result;
      return res.status(200).send({
        status: true,
        message: "wallet fetched successfully",
        response: result,
      });
    }
     else {
      return res.status(200).send({
        status: true,
        message: "wallet fetched successfully",
        response: result,
      });
    }
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    });
  }
};

///////Create Event Wallet 
module.exports.createEventWallet = async (req, res) => {
  try {
    const { _id } = req.user;
    const check = await eventWalletModel.findOne({ user_id: _id });
    if (!check) {
      const user = await userModels.findOne({ _id });
      const result = await eventWalletModel.create({
        user_id: _id,
      });
      res.status(201).send({
        status: true,
        message: "Event wallet created successfully",
        response: result,
      });
    } else {
      const { _id } = req.user;
      const { currency } = await userModels.findOne({ _id: req.user._id })
      const results = await eventWalletModel.findOne({ user_id: _id });
      let amounts = results?.balance;
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

      console.log("amountsamountsamountsamounts",amounts);
      if (amounts != 0) {
         const response = await fetch(
            `https://api.apilayer.com/exchangerates_data/convert?to=${to}&from=${from}&amount=${amounts}`,
            {
              headers: head,
            }
          );
        const res1 = await response.json();
        console.log("res1res1res1res1res1",res1);
        results.convert_balance = res1.result;
        return res.status(200).send({
          status: true,
          message: "wallet fetched successfully",
          response: results,
        });
      } else {

        console.log("sfsdgdgsdgdg");
          return res.status(200).send({
          status: true,
          message: "wallet fetched successfully",
          response: results,
        });
      }
    }
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
      stack: err.stack,
    });
  }
};

// //getDetailsUser............
// module.exports.getUserDetails = async (req, res) => {
//     const{userId} = req.query
//     const _id =userId
//     console.log("userId",userId);
//       try{
//             const saved_user = await userModel.findById({_id:_id},{_id:0,name:1,profile:1})
//             console.log(saved_user);
//           if (saved_user) {
//               res.status(200).send({"success":"True", "status": "200", "message": "get user Details succesfully",saved_user})
//             } else {
//               res.status(401).send({ "status": "failed", "message": "Something Went Wrong" })
//             }
//           }catch(err){
//             res.status(401).send({"success":"True", "status": "failed", "message": "userId Is Wrong" })
//           }
//             }

// //payment.....................
// module.exports.payment = async (req, res) => {
//     const {  userIdFrom,userIdTo, amount,addNote} = req.body
//     if ( userIdFrom && userIdTo && amount && amount) {
//             try {
//                 const doc = new walletModel({
//                     userIdFrom: userIdFrom,
//                     userIdTo: userIdTo,
//                     amount:amount,
//                     addNote :addNote,
//                 })
//                 await doc.save()
//                 console.log(doc);
//               res.status(200).send({"success":"True", "status": "200", "message": "Add payment Successfully",})
//               }catch (error) {
//                 console.log(error)
//                 res.status(401).send({ "success":"false", "Status": "401", "message": "Unable to Add" })
//               }
//             } else {
//             res.status(401).send({"success":"false", "status": "401","message": "All fields are required" })
//           }
//         }


