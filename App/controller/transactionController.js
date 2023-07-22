
"use strict";
const TransactionModel = require("../models/transactionModel");
const userModels = require("../models/userModel");
const WalletModel = require("../models/walletModel");
const eventWalletModel = require("../models/eventWalletModel.js");
const { stripe } = require("../../server.js");
const { convertRate } = require("../utils/convertRate");
var fetch = require("node-fetch");
var paypal = require('paypal-rest-sdk');
var sessionstorage = require('sessionstorage');
const crypto = require('crypto');
let eventModel = require("../models/eventModel.js");
const currencyes = require('currency.js');
const Flutterwave = require('flutterwave-node-v3');
const morx = require('morx');
const flw = new Flutterwave("FLWPUBK_TEST-0f9d6b1781c35eb4357a7bce14ef996c-X", "FLWSECK_TEST-797bdaeec83ac0ac9ad53bedb1c8c2e0-X");
const AddCard = require("../models/addCardModel");



//*****************************************************************************************************************************/
//send money Api  //
//****************************************************************************************************************************/



// module.exports.sendMoney = async (req, res) => {
//   try {
//     let { contact_id, amount, contact_name, note, date, time } = req.body;
//     let { _id: user_id, name } = req.user;
//     let userTransaction = await TransactionModel.findOne({ user_id });
//     let contactTransaction = await TransactionModel.findOne({
//       user_id: contact_id,
//     });

//     // sender's customer id
//     let customer_1 = await WalletModel.findOne({ user_id });
//     // receiver customer id
//     let customer_2 = await WalletModel.findOne({ user_id: contact_id });

//     const list = await stripe.customers.list();

//     const { balance: balance_1 } = list.data.find(
//       (v) => v.id === customer_1.customer_id
//     );
//     const { balance: balance_2 } = list.data.find(
//       (v) => v.id === customer_2.customer_id
//     );

//     // checking if both side have transaction model or not if not we will create them
//     if (!userTransaction)
//       await TransactionModel.create({ user_id, transactions: [] });
//     if (!contactTransaction)
//       await TransactionModel.create({ user_id: contact_id, transactions: [] });

//     //  checking if user have enough amount to transfer
//     if (balance_1 < amount) throw new Error("Insufficeint Balance!!");

//     // updating balance in stripe and wallet of sender ---------------------------------------------
//     const stripe1 = await stripe.customers.update(customer_1.customer_id, {
//       balance: balance_1 - parseInt(amount),
//     });

//     let userData = await WalletModel.updateOne(
//       { user_id },
//       { $set: { balance: stripe1.balance } }
//     );
//     // ----------------------------------------------------------------------------------

//     // if amount updates then inserting the transaction data
//     if (userData.modifiedCount === 1)
//       await TransactionModel.updateOne(
//         { user_id },
//         {
//           $push: {
//             transactions: {
//               contact_id,
//               amount,
//               type: "1",
//               contact_name,
//               note,
//               date,
//               time,
//             },
//           },
//         }
//       );

//     // updating balance in stripe and wallet of reciever --------------------------------------------
//     const stripe2 = await stripe.customers.update(customer_2.customer_id, {
//       balance: balance_2 + amount,
//     });

//     let contactData = await WalletModel.updateOne(
//       { user_id: contact_id },
//       { $set: { balance: stripe2.balance } }
//     );
//     // ---------------------------------------------------------------------------------------------

//     // if amount updates then inserting the transaction data
//     if (contactData.modifiedCount === 1)
//       await TransactionModel.updateOne(
//         { user_id: contact_id },
//         {
//           $push: {
//             transactions: {
//               contact_id: user_id,
//               amount,
//               type: "0",
//               contact_name: name,
//               note,
//               date,
//               time,
//             },
//           },
//         }
//       );

//     // if (userData.modifiedCount !== 1 && contactData.modifiedCount !== 1)
//     //   throw new Error(" something went wrong");

//     const result = await WalletModel.findOne({ user_id });
//     res.status(200).send({
//       status: true,
//       message: "transfer successful!",
//       response: result,
//     });
//   } catch (error) {
//     res.status(401).send({
//       status: false,
//       message: error.message,
//       stack: error.stack,
//     });
//   }
// };

// module.exports.sendMoney = async (req, res) => {
//   try {
//     let { contact_id, amount, contact_name, note, date, time, event_id, reference, feeCutAmount } =
//       req.body;
//     let { _id: user_id, name } = req.user;
//     let userTransaction = await TransactionModel.findOne({ user_id: req.user._id });
//     let contactTransaction = await TransactionModel.findOne({
//       user_id: contact_id,
//     });
//     if (event_id) {

//     //      if(contact_id.toString() == req.user._id.toString()){
//     //     throw new Error("Can not perform action with own Contact")
//     //   }


//       const fetch_event = await eventModel.findOne({ _id: event_id });

//       console.log("++++++++++++++++++", fetch_event);
//       // if( parseInt(fetch_event?.chooseAmount) < parseInt(amount)){
//       //  return res.status(401).send({
//       //     status: false,
//       //     message: "Your amount is greater than the event amount.",
//       //   });
//       // }
//       // sender's customer idcontactData.modifiedCount === 1
//       let customer_1 = await WalletModel.findOne({ user_id: req.user._id });
//       // receiver customer id
//       let customer_2 = await WalletModel.findOne({ user_id: contact_id });



//       // checking if both side have transaction model or not if not we will create them
//       if (!userTransaction)
//         await TransactionModel.create({ user_id, transactions: [] });
//       if (!contactTransaction)
//         await TransactionModel.create({ user_id: contact_id, transactions: [] });

//       // //  checking if user have enough amount to transfer
//       if (customer_1.balance < amount) throw new Error("Insufficient funds!!");

//       // // updating balance in stripe and wallet of sender ---------------------------------------------


//       let userDataaa = await WalletModel.findOne({ user_id: req.user._id })

//       const senderuser = userDataaa.balance - amount;

//       let userData = await WalletModel.updateOne(
//         { user_id: req.user._id },
//         { $set: { balance: senderuser } },
//       );

//       // // ----------------------------------------------------------------------------------

//       let trans1 = {
//         contact_id,
//         payeer_id: req.user._id,
//         amount,
//         type: "1",
//         contact_name,
//         note,
//         date,
//         time,
//         reference,
//         feeCutAmount
//       };

//       event_id ? (trans1.event_id = event_id) : null;

//       // if amount updates then inserting the transaction data
//       if (userData.modifiedCount === 1)
//         await TransactionModel.updateOne(
//           { user_id: req.user._id },
//           {
//             $push: {
//               transactions: trans1,
//             },
//           }
//         );

//       let contactDataaa = await eventWalletModel.findOne({ user_id: contact_id })

//       const reciverUser = contactDataaa.balance + amount;


//       let contactData = await eventWalletModel.updateOne(
//         { user_id: contact_id },
//         { $set: { balance: reciverUser } }
//       );
//       // // ---------------------------------------------------------------------------------------------
//           const user_amount = (amount / 100) * 3.9 + 1.50;

//       let trans2 = {
//         contact_id: user_id,
//         payeer_id: req.user._id,
//         amount: user_amount,
//         type: "0",
//         contact_name: name,
//         note,
//         date,
//         time,
//         reference,
//         feeCutAmount
//       };

//       event_id ? (trans2.event_id = event_id) : null;

//       // if amount updates then inserting the transaction data
//       if (contactData.modifiedCount === 1)
//         // await TransactionModel.updateOne(
//         //   { user_id: contact_id },
//         //   {
//         //     $push: {
//         //       transactions: trans2,
//         //     },
//         //   }
//         // );

//       if (userData.modifiedCount !== 1 && contactData.modifiedCount !== 1)
//         throw new Error(" something went wrong");

//       const result = await WalletModel.findOne({ user_id: req.user._id });


//       res.status(200).send({
//         status: true,
//         message: "transfer successful!",
//         response: result,
//       });
//     } else {

//          if(contact_id.toString() == req.user._id.toString()){
//         throw new Error("Can not perform action with own Contact")
//       }


//       // sender's customer id
//       let customer_1 = await WalletModel.findOne({ user_id: req.user._id });
//       // receiver customer id
//       let customer_2 = await WalletModel.findOne({ user_id: contact_id });



//       // checking if both side have transaction model or not if not we will create them
//       if (!userTransaction)
//         await TransactionModel.create({ user_id, transactions: [] });
//       if (!contactTransaction)
//         await TransactionModel.create({ user_id: contact_id, transactions: [] });

//       // //  checking if user have enough amount to transfer
//       if (customer_1.balance < amount) throw new Error("Insufficient Funds!!");

//       // // updating balance in stripe and wallet of sender ---------------------------------------------


//       let userDataaa = await WalletModel.findOne({ user_id: req.user._id })

//       const senderuser = userDataaa.balance - parseInt(amount);

//       let userData = await WalletModel.updateOne(
//         { user_id: req.user._id },
//         { $set: { balance: senderuser } },
//       );

//       // // ----------------------------------------------------------------------------------

//       let trans1 = {
//         contact_id,
//         payeer_id: req.user._id,
//         amount,
//         type: "1",
//         contact_name,
//         note,
//         date,
//         time,
//         reference,
//         feeCutAmount
//       };

//       event_id ? (trans1.event_id = event_id) : null;

//       // if amount updates then inserting the transaction data
//       if (userData.modifiedCount === 1)
//         await TransactionModel.updateOne(
//           { user_id: req.user._id },
//           {
//             $push: {
//               transactions: trans1,
//             },
//           }
//         );

//       let contactDataaa = await WalletModel.findOne({ user_id: contact_id })

//       const reciverUser = contactDataaa.balance + parseInt(amount);

//       let contactData = await WalletModel.updateOne(
//         { user_id: contact_id },
//         { $set: { balance: reciverUser } }
//       );
//       // // ---------------------------------------------------------------------------------------------
//       const user_amount = (amount / 100) * 3.9 + 0.70;

//       let trans2 = {
//         contact_id: user_id,
//         payeer_id: req.user._id,
//         amount: user_amount,
//         type: "0",
//         contact_name: name,
//         note,
//         date,
//         time,
//         reference,
//         feeCutAmount
//       };

//       event_id ? (trans2.event_id = event_id) : null;

//       // if amount updates then inserting the transaction data
//       if (contactData.modifiedCount === 1)
//         await TransactionModel.updateOne(
//           { user_id: contact_id },
//           {
//             $push: {
//               transactions: trans2,
//             },
//           }
//         );

//       if (userData.modifiedCount !== 1 && contactData.modifiedCount !== 1)
//         throw new Error(" something went wrong");

//       const result = await WalletModel.findOne({ user_id: req.user._id });


//       res.status(200).send({
//         status: true,
//         message: "transfer successful!",
//         response: result,
//       });

//     }
//   } catch (error) {
//     res.status(401).send({
//       status: false,
//       message: error.message,
//       stack: error.stack,
//     });
//   }
// };

module.exports.sendMoney = async (req, res) => {
  try {
    let {
      contact_id,
      amounts,
      contact_name,
      note,
      date,
      time,
      event_id,
      reference,
      payment_type,
      feeCutAmount,
    } = req.body;



    var amount = parseFloat(amounts.replace(" "))
    console.log("valuevaluevaluevalue", amount)

    let { _id: user_id, name } = req.user;
    let userTransaction = await TransactionModel.findOne({
      user_id: req.user._id,
    });
    let contactTransaction = await TransactionModel.findOne({
      user_id: contact_id,
    });
    if (event_id) {


      const fetch_event = await eventModel.findOne({ _id: event_id });


      // sender's customer idcontactData.modifiedCount === 1
      let customer_1 = await WalletModel.findOne({ user_id: req.user._id });
      // receiver customer id
      let customer_2 = await WalletModel.findOne({ user_id: contact_id });

      // checking if both side have transaction model or not if not we will create them
      if (!userTransaction)
        await TransactionModel.create({ user_id, transactions: [] });
      if (!contactTransaction)
        await TransactionModel.create({
          user_id: contact_id,
          transactions: [],
        });

      // //  checking if user have enough amount to transfer
      if (customer_1.balance < amount) throw new Error("Insufficient funds!!");

      // // updating balance in stripe and wallet of sender ---------------------------------------------

      // let userDataaa = await WalletModel.findOne({ user_id: req.user._id })

      // const senderuser = userDataaa.balance - amount;

      // let userData = await WalletModel.updateOne(
      //   { user_id: req.user._id },
      //   { $set: { balance: senderuser } },
      // );


      if (payment_type === '0') {

        let userDataaa = await WalletModel.findOne({ user_id: req.user._id });

        const senderuser = userDataaa.balance - amount;
        var userWalletData = await WalletModel.updateOne(
          { user_id: req.user._id },
          { $set: { balance: senderuser } }
        );
      }
      if (payment_type === '1') {

        let eventWallet = await eventWalletModel.findOne({ user_id: req.user._id });
        const senderuser = eventWallet.balance - amount;
        var userEventData = await eventWalletModel.updateOne(
          { user_id: req.user._id },
          { $set: { balance: senderuser } }
        );
      }


      // // ----------------------------------------------------------------------------------

      let trans1 = {
        contact_id,
        payeer_id: req.user._id,
        amount,
        type: "1",
        contact_name,
        note,
        date,
        time,
        reference,
        feeCutAmount
      };
      event_id ? (trans1.event_id = event_id) : null;

      // if amount updates then inserting the transaction data
      if (userWalletData?.modifiedCount === 1 || userEventData?.modifiedCount === 1)
        await TransactionModel.updateOne(
          { user_id: req.user._id },
          {
            $push: {
              transactions: trans1,
            },
          }
        );

      let contactDataaa = await eventWalletModel.findOne({
        user_id: contact_id,
      });
      const reciverUser = contactDataaa.balance + amount;
      let contactData = await eventWalletModel.updateOne(
        { user_id: contact_id },
        { $set: { balance: reciverUser } }
      );
      const payout = {
        sender_batch_header: {
          sender_batch_id: 'DEPOSIT_' + Date.now(),
          email_subject: 'Deposit Money'
        },
        items: [{
          recipient_type: 'EMAIL',
          amount: {
            value: feeCutAmount,
            currency: 'USD'
          },
          receiver: "sb-34cop26186416@business.example.com",
          note: 'Deposit to PayPal account'
        }]
      };

      paypal.payout.create(payout, (error, payout) => {
        if (error) {
          callback(error);
        } else {
          callback(null, payout);
        }
      });


      // // ---------------------------------------------------------------------------------------------
      //   const user_amount = (amount / 100) * 3.9 + 1.5;

      let trans2 = {
        contact_id: user_id,
        payeer_id: req.user._id,
        amount: amount,
        type: "0",
        contact_name: name,
        note,
        date,
        time,
        reference,
        feeCutAmount
      };

      event_id ? (trans2.event_id = event_id) : null;

      // if amount updates then inserting the transaction data
      // if (contactData.modifiedCount === 1)
      // if (userWalletData?.modifiedCount !== 1 || userEventData?.modifiedCount !== 1 && contactData.modifiedCount !== 1)
      // await TransactionModel.updateOne(
      //   { user_id: contact_id },
      //   {
      //     $push: {
      //       transactions: trans2,
      //     },
      //   }
      // );

      // throw new Error(" something went wrong");

      const result = await eventWalletModel.findOne({ user_id: req.user._id });

      res.status(200).send({
        status: true,
        message: "transfer successful!",
        response: result,
      });
    } else {
      if (contact_id.toString() == req.user._id.toString()) {
        throw new Error("Can not perform action with own Contact");
      }

      // sender's customer id
      let customer_1 = await WalletModel.findOne({ user_id: req.user._id });
      // receiver customer id
      let customer_2 = await WalletModel.findOne({ user_id: contact_id });

      // checking if both side have transaction model or not if not we will create them
      if (!userTransaction)
        await TransactionModel.create({ user_id, transactions: [] });
      if (!contactTransaction)
        await TransactionModel.create({
          user_id: contact_id,
          transactions: [],
        });

      // //  checking if user have enough amount to transfer
      if (customer_1.balance < amount) throw new Error("Insufficient Funds!!");

      // // updating balance in stripe and wallet of sender ---------------------------------------------

      var userDataaa = await WalletModel.findOne({ user_id: req.user._id });
      //   if (payment_type == "0") {
      //   var userDataaa = await WalletModel.findOne({ user_id: req.user._id });
      //   }
      //   if (payment_type == "1") {
      //   var userDataaa = await eventWalletModel.findOne({ user_id: req.user._id });
      //   }

      const senderuser = userDataaa.balance - parseInt(amount);

      let userData = await WalletModel.updateOne(
        { user_id: req.user._id },
        { $set: { balance: senderuser } }
      );

      // // ----------------------------------------------------------------------------------

      let trans1 = {
        contact_id,
        payeer_id: req.user._id,
        amount,
        type: "1",
        contact_name,
        note,
        date,
        time,
        reference,
      };

      event_id ? (trans1.event_id = event_id) : null;

      // if amount updates then inserting the transaction data
      if (userData.modifiedCount === 1)
        await TransactionModel.updateOne(
          { user_id: req.user._id },
          {
            $push: {
              transactions: trans1,
            },
          }
        );

      let contactDataaa = await WalletModel.findOne({ user_id: contact_id });

      const reciverUser = contactDataaa.balance + parseInt(amount);

      let contactData = await WalletModel.updateOne(
        { user_id: contact_id },
        { $set: { balance: reciverUser } }
      );
      // // ---------------------------------------------------------------------------------------------
      const user_amount = (amount / 100) * 3.9 + 0.7;

      let trans2 = {
        contact_id: user_id,
        payeer_id: req.user._id,
        amount: user_amount,
        type: "0",
        contact_name: name,
        note,
        date,
        time,
        reference,
      };

      event_id ? (trans2.event_id = event_id) : null;

      // if amount updates then inserting the transaction data
      if (contactData.modifiedCount === 1)
        await TransactionModel.updateOne(
          { user_id: contact_id },
          {
            $push: {
              transactions: trans2,
            },
          }
        );

      if (userData.modifiedCount !== 1 && contactData.modifiedCount !== 1)
        throw new Error(" something went wrong");

      const result = await WalletModel.findOne({ user_id: req.user._id });

      res.status(200).send({
        status: true,
        message: "transfer successful!",
        response: result,
      });
    }
  } catch (error) {
    res.status(401).send({
      status: false,
      message: error.message,
      stack: error.stack,
    });
  }
};//*****************************************************************************************************************************/
//fetch Transactions Api  //
//****************************************************************************************************************************/

module.exports.fetchTransactions = async (req, res) => {
  try {
    const { _id } = req.user;
    const { currency } = await userModels.findOne({ _id: req.user._id })


    let result = await TransactionModel.findOne({ user_id: _id }).populate(
      {
        path: "transactions.contact_id",
        select: "_id profile",
      }
    );
    result = result?.transactions?.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
    if (result) {
      const updatedData = await Promise?.all(result?.map(async (data) => {
        let amounts = data?.amount;
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
          data.convert_amount = res1.result;
          return data;
        }
      }));
    }

    res.status(200).send({
      status: true,
      message: "data fetched successfully",
      response: result ? result : [],
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
//search Transactions Api  //
//****************************************************************************************************************************/

module.exports.searchTransactions = async (req, res) => {
  try {
    const { name } = req.query;
    let result = await TransactionModel.findOne({
      user_id: req.user._id,
    });
    result = result.transactions.filter(({ contact_name }) => contact_name.includes(name));
    res.status(200).send({
      status: true,
      message: "success",
      response: result,
    });
  } catch (error) {
    res.status(401).send({
      status: false,
      message: error.message,
    });
  }
};


//*****************************************************************************************************************************/
//donePayment Api  //
//****************************************************************************************************************************/

module.exports.donePayment = async (req, res) => {
  try {
    let { checkout_id, cus_id } = req.query;

    const session = await stripe.checkout.sessions.retrieve(checkout_id);
    const list = await stripe.customers.list();

    const user = await WalletModel.findOne({ customer_id: cus_id });
    const { currency } = await userModels.findOne({ _id: user.user_id });

    // const { balance } = list.data.find((v) => v.id === cus_id);
    // let converted = await convertRate(
    //   session.amount_total,
    //   user.user_id.currency,
    //   "usd"
    // );
    let amount = session.amount_total;
    let from = currency;
    let to = "usd"
    const head = {
      apiKey: "AthhwZmvX4a7uJwk3u6NE44xmCTfjdwS",
    };

    var requestOptions = {
      method: "GET",
      redirect: "follow",
      headers: head,
    };

    fetch(
      `https://api.apilayer.com/exchangerates_data/convert?to=${to}&from=${from}&amount=${amount}`,
      {
        headers: head
      }
    ).then((response) => response.json()).then(async (res1) => {
      const wallet = await WalletModel.findOneAndUpdate(
        { customer_id: cus_id },
        { $set: { balance: res1.result } },
        { new: true }
      );
      res.status(200).send(`
    <!doctype html>
<html lang="en">

<head>
	<title>Django Payments App</title>
	<!-- Required meta tags -->
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

	<!-- Bootstrap CSS -->
	<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
		integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
</head>

<body>

<div class="container">
    <div class="jumbotron text-center mt-5">
        <h1 class="text-success">Payment Success</h1>
    </div>
</div>
</body>

</html>
    `);
    })
    // console.log("converted::" ,converted)
    // const customer = await stripe.customers.update(cus_id, {
    //   balance: balance + converted,
    // });


  } catch (error) {
    res.status(401).send({
      status: false,
      message: error.message,
      stack: error.stack,
    });
  }
};

// --------------------------- Match pin api -------------------------------------------


module.exports.confirmPin = async (req, res) => {
  try {
    const { pin } = req.body;
    const user = await userModels.findOne({ _id: req.user._id })
    if (user.pin == pin) {
      return res.status(200).json({
        status: true,
        message: "Confirm",
      })
    } else {
      return res.status(401).json({
        status: false,
        message: "Incorrect pin ",
      })
    }
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
      stack: err.stack,
    })
  }

}


// --------------------------- bank tranfer ammount  -------------------------------------------


module.exports.transferMoneyFromBank = async (req, res) => {
  try {
    const { amount, currency, sender_account_id, receiver_email, account_number, account_name, bank_name, routing_number } = req.body;
    const prefix = 'batch_';
    const randomBytes = crypto.randomBytes(6).toString('base64');
    const suffix = randomBytes.replace(/[+/=]/g, '').toUpperCase();
    const payout = {
      sender_batch_header: {
        sender_batch_id: `${prefix + suffix}`,
        email_subject: 'Your payout is ready!',
      },
      items: [
        {
          recipient_type: 'EMAIL',
          amount: {
            value: `${amount}`,
            currency: `${currency}`,
          },
          note: 'Thank you for your business!',
          sender_item_id: `${sender_account_id}`,
          receiver: `${receiver_email}`,
          account_number: `${account_number}`,
          account_name: `${account_name}`,
          bank_name: `${bank_name}`,
          routing_number: `${routing_number}`,
        },
      ],
    };
    paypal.payout.create(payout, function (error, payout) {
      if (error) {
        console.log(error.response);
        throw error;
      } else {
        return res.status(200).send({
          status: true,
          message: "Payouts created successfully",
          responce: payout,
          amount: amount,
        });
      }
    });
  } catch (err) {
    res.status(401).send({
      status: false,
      message: err.message,
      stack: err.stack,
    });
  }
}


module.exports.withdrowAmount = async (req, res) => {
  try {
    const { payment_type, amount, sender_account_id, card_number, card_type, expiry_month, expiry_year, cvv2, first_name, last_name, receiver_email } = req.body;
    const prefix = 'batch_';
    const randomBytes = crypto.randomBytes(6).toString('base64');
    const suffix = randomBytes.replace(/[+/=]/g, '').toUpperCase();

    const payout = {
      sender_batch_header: {
        sender_batch_id: `${prefix + suffix}`,
        email_subject: 'You have a payout!',
      },
      items: [
        {
          recipient_type: 'EMAIL',
          amount: {
            value: amount,
            currency: 'USD'
          },
          receiver: receiver_email,
          note: 'Thank you.',
          sender_item_id: sender_account_id,
          payout_item: {
            recipient_type: 'EMAIL',
            receiver: receiver_email,
          },
          sender_push_notification: {
            message: 'You have received a payout!'
          },
          receiver_card_details: {
            card_number: card_number,
            card_type: card_type,
            expiry_month: expiry_month,
            expiry_year: expiry_year,
            cvv2: cvv2,
            first_name: first_name,
            last_name: last_name,
          }
        }
      ]
    };

    paypal.payout.create(payout, async function (error, payout) {
      if (error) {
        console.log(error.response);
        throw error;
      } else {
        let customer_1 = await WalletModel.findOne({ user_id: req.user._id });
        let eventBlance = await eventWalletModel.findOne({ user_id: req.user._id })

        if (payment_type == "0") {
          if (customer_1.balance < amount) throw new Error("Insufficient funds!!");
          const wallet = await WalletModel.findOne({ user_id: req.user._id })
          const updatedbalance = wallet?.balance - amount
          const wallets = await WalletModel.findOneAndUpdate(
            { user_id: req.user._id },
            { $set: { balance: updatedbalance } },
            { new: true })
          return res.status(200).send({
            status: true,
            message: "Payouts created successfully",
            responce: wallets,
          });
        }

        if (payment_type == "1") {
          if (eventBlance.balance < amount) throw new Error("Insufficient funds!!");
          let eventWallet = await eventWalletModel.findOne({ user_id: req.user._id });
          const senderuser = eventWallet.balance - amount;
          var userEventData = await eventWalletModel.findOneAndUpdate(
            { user_id: req.user._id },
            { $set: { balance: senderuser } }, { new: true }
          );
          return res.status(200).send({
            status: true,
            message: "Payouts created successfully",
            responce: userEventData,
          });
        }
      }
    });



  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
      stack: err.satck,
    })
  }
}






module.exports.getpayoutMoney = async (req, res) => {
  try {
    const { payout_batch_id, amount, ToCurrency } = req.body;
    paypal.payout.get(payout_batch_id, async function (error, payout) {
      if (error) {
        console.error(error);
      } else {
        const { currency } = await userModels.findOne({ _id: req.user._id });
        let amounts = amount;
        let from = 'USD';
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
          const wallet = await WalletModel.findOne({ user_id: req.user._id })
          const updatedbalance = wallet?.balance - res1.result
          const updated = updatedbalance.toFixed(2);
          const wallets = await WalletModel.findOneAndUpdate(
            { user_id: req.user._id },
            { $set: { balance: updated } },
            { new: true }

          );
        })
        return res.status(200).send({
          status: true,
          message: "Payout details",
          responce: payout,
        });
      }
    });
  } catch (err) {
    res.status(401).send({
      status: false,
      message: err.message,
      stack: err.stack,
    });
  }

}

// --------------------------- bank tranfer ammount end api  -------------------------------------------



// --------------------------- Deposit Money API -------------------------------------------

// module.exports.depositMoney = async (req, res) => {
//   try {
//     const { amount } = req.body;
//     const { id: product_id } = await stripe.products.create({
//       name: "Transfer to Wallet",
//     });
//     const { customer_id, user_id } = await WalletModel.findOne({
//       user_id: req.user._id,
//     }).populate({ path: "user_id", select: "currency" });

//     const { id: price_id } = await stripe.prices.create({
//       unit_amount: amount,
//       currency: user_id.currency,
//       product: product_id,
//     });

//     const session = await stripe.checkout.sessions.create({
//       success_url: `https://app.africabba.com/donePayment?checkout_id={CHECKOUT_SESSION_ID}&cus_id=${customer_id}`,
//       line_items: [{ price: price_id, quantity: 1 }],
//       mode: "payment",
//     });

//     res.status(200).send({
//       status: true,
//       message: "Payment link created successfully",
//       response: session,
//     });
//   } catch (error) {
//     res.status(401).send({
//       status: false,
//       message: error.message,
//       stack: error.stack,
//     });
//   }
// };

module.exports.depositMoney = async (req, res) => {
  try {
    const { amount, currency } = req.body;
    // sessionstorage.setItem("user_id", req.user._id);
    sessionstorage.setItem("amount", amount);
    sessionstorage.setItem("currency", currency);
    const amounts = parseFloat(amount).toFixed(2)
console.log("test",amount)
    var payment = {
      'intent': 'sale',
      'payer': {
        'payment_method': 'paypal'
      },
      'redirect_urls': {
        "return_url": "http://18.219.235.165:8000/success",
        "cancel_url": "http://18.219.235.165:8000/err"
      },
      'transactions': [{
        'amount': {
          'total': `${amounts}`, 
          'currency': `${currency}`,
        }
      }]
    };
    await paypal.payment.create(payment, function (error, payment) {
      if (error) {
        console.log(error);
      } else {
        console.log(payment);
        // Redirect the user to the PayPal payment approval page
        for (var i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === 'approval_url') {
            return res.status(200).json({
              status: true,
              response: payment.links[i].href,
            });
          }
        }
      }
    });
  } catch (error) {
    res.status(401).send({
      status: false,
      message: error.message,
      stack: error.stack,
    });
  }
};


module.exports.paymentExecute = async (req, res) => {
  try {
    const userId = sessionstorage.getItem("user_id");
    const amount = sessionstorage.getItem("amount");
    const ToCurrency = sessionstorage.getItem("currency");
    var paymentId = req.query.paymentId;
    var payerId = { 'payer_id': req.query.PayerID };
    paypal.payment.execute(paymentId, payerId, async function (error, payment) {
      if (error) {
        console.error(error);
      } else {
        if (payment.state === 'approved') {
          const { currency } = await userModels.findOne({ _id: userId });

          let amounts = amount;
          let from = 'USD';
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
            const wallet = await WalletModel.findOne({ user_id: userId })
            const updatedbalance = wallet?.balance + parseInt(res1.result)

            console.log("updatedbalanceupdatedbalanceupdatedbalanceupdatedbalance", updatedbalance)

            const wallets = await WalletModel.findOneAndUpdate(
              { user_id: userId },
              { $set: { balance: updatedbalance } },
              { new: true }

            );
          })
          res.send(`
          <div style='float: left; width: 100%; height: 100vh; display: flex; flex-wrap: wrap;  text-align: center;  padding: 40px; background: #EBF0F5;'> 
      <div class="card" style=' background: white;
        padding: 60px;
        border-radius: 4px;
        box-shadow: 0 2px 3px #C8D0D8;
        display: inline-block;
        margin: 0 auto;
        height: 400px;'>
      <div style="border-radius:200px; height:200px; width:200px; background: #F8FAF5; margin:0 auto;">
        <i style='color: #9ABC66;
        font-size: 100px;
        line-height: 200px;
        margin-left:-15px;' class="checkmark">✓</i>
      </div>
        <h1 style='color: #88B04B;
          font-weight: 900;
          font-size: 40px;
          margin-bottom: 10px;'>Payment Success</h1> 
        <p style='color: #404F5E;
          font-family: "Nunito Sans", "Helvetica Neue", sans-serif;
          font-size:20px;
          margin: 0;'>We received your order. You can now close this window</p>
      </div>
        </div> `);
        } else {
          res.send(` <div style='float: left; width: 100%; height: 100vh; display: flex; flex-wrap: wrap;  text-align: center;  padding: 40px; background: #EBF0F5;'> 
          <div class="card" style=' background: white;
            padding: 60px;
            border-radius: 4px;
            box-shadow: 0 2px 3px #C8D0D8;
            display: inline-block;
            margin: 0 auto;height: 400px;'>
          <div style="border-radius:200px; height:200px; width:200px; background: #ffb2b2; margin:0 auto; ">
            <i style='color: red;
            font-size: 100px;
            line-height: 200px;
            margin-left:-15px;' class="checkmark">&#10060;</i>
          </div>
            <h1 style='color: red;
              font-weight: 900;
              font-size: 40px;
              margin-bottom: 10px;'>Payment Cancel</h1> 
            <p style='color: #404F5E;
              font-family: "Nunito Sans", "Helvetica Neue", sans-serif;
              font-size:20px;
              margin: 0;'>We have not received your order. You can now close this window and try again </p>
          </div>
            </div> `);
        }
      }
    });

  } catch (err) {
    res.status(401).send({
      status: false,
      message: err.message,
      stack: err.stack,
    });
  }
}























// --------------------------- Withdrawal Money API -------------------------------------------

module.exports.withdrawalMoney = async (req, res) => {
  try {
    const {
      amount,
      account_number,
      country,
      routing_number,
      currency,
      account_holder_name,
      account_holder_type,
    } = req.body;
    const { email } = await userModels.findOne({ _id: req.user._id });
    const { account_id, balance } = await WalletModel.findOne({
      user_id: req.user._id,
    });

    if (balance < amount) throw new Error("Insufficient Funds!!");
    const list = await stripe.customers.list();
    let check = list.data.find((v) => v.email === email);

    const account = await stripe.accounts.update(account_id, {
      external_account: {
        object: "bank_account",
        country,
        currency,
        account_number,
        routing_number,
      },
    });

    const payout = await stripe.payouts.create({
      currency,
      amount,
      source_type: "bank_account",
      destination: account.id,
    });

    const updateAmount = await stripe.customers.update(check.id, {
      balance: check.balance - parseInt(amount),
    });

    const wallet = await WalletModel.updateOne(
      { user_id: req.user._id },
      { $set: { balance: updateAmount.balance } }
    );

    // const wallet = await WalletModel.updateOne({customer_id:check.id},{$push: {receipts: paymentIntent.}})
    res.status(200).send({
      status: true,
      message: "Amount has been successfully withdrawed to Your Bank Account",
      response: payout,
      balance: updateAmount,
    });
  } catch (error) {
    res.status(401).send({
      status: false,
      message: error.message,
      stack: error.stack,
    });
  }
};

// ***********************************************************fetch Incomes Transaction****************************************************************************

module.exports.fetchIncomesTransaction = async (req, res) => {
  try {

    const user_id = req.user.id;
    const { currency } = await userModels.findOne({ _id: req.user._id })
    let fetchIncomesTransaction = await TransactionModel.findOne({ user_id: user_id }).populate(
      {
        path: "transactions.contact_id",
        select: "_id profile",
      }
    );
    fetchIncomesTransaction = fetchIncomesTransaction?.transactions?.filter((v) => v.type === "0");
    if (fetchIncomesTransaction) {
      const updatedData = await Promise.all(fetchIncomesTransaction?.map(async (data) => {
        let amounts = data?.amount;
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
          data.convert_amount = res1.result;
          return data;
        }
      }));
    }
    const result = fetchIncomesTransaction?.sort((a, b) => b.createdAt - a.createdAt);
    res.status(200).send({
      status: true,
      message: "Fetch Incomes Transaction",
      response: result ? result : [],
    });
  } catch (error) {
    return res.status(401).send({
      status: false,
      message: error.message,
      stack: error.stack,
    });
  }

};
// ***********************************************************fetch Expenses Transaction****************************************************************************

module.exports.fetchExpensesTransaction = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { currency } = await userModels.findOne({ _id: req.user._id })
    let fetchExpensesTransaction = await TransactionModel.findOne({ user_id: user_id }).populate(
      {
        path: "transactions.contact_id",
        select: "_id profile",
      }
    );
    fetchExpensesTransaction = fetchExpensesTransaction?.transactions?.filter((v) => v.type === "1");
    if (fetchExpensesTransaction) {
      const updatedData = await Promise.all(fetchExpensesTransaction?.map(async (data) => {
        let amounts = data?.amount;
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
          data.convert_amount = res1.result;
          return data;
        }
      }));
    }
    const result = fetchExpensesTransaction?.sort((a, b) => b.createdAt - a.createdAt);
    res.status(200).send({
      status: true,
      message: "Fetch Incomes Transaction",
      response: result ? result : [],
    });
  } catch (error) {
    return res.status(401).json({
      status: false,
      message: error.message,
      stack: error.stack,
    });
  }

};

//*****************************************************************************************************************************/
//Expenses search Transactions Api  //
//****************************************************************************************************************************/

module.exports.ExpensesSearchTransactions = async (req, res) => {
  try {
    const { name } = req.query;
    const { currency } = await userModels.findOne({ _id: req.user._id })

    let result = await TransactionModel.findOne({
      user_id: req.user._id,
    });

    const arr = [];
    result.transactions.map((vel) => {
      if (vel.type == "1") {
        arr.push(vel);
      }
    });

    const data = arr.filter(({ contact_name }) => contact_name.includes(name))
    if (data) {
      const updatedData = await Promise.all(data?.map(async (data) => {
        let amounts = data?.amount;
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
          data.convert_amount = res1.result;
          return data;
        }
      }));
    }

    res.status(200).send({
      status: true,
      message: "success",
      response: data,
    });
  } catch (error) {
    res.status(401).send({
      status: false,
      message: error.message,
    });
  }
};

//*****************************************************************************************************************************/
// Incomes search Transactions Api  //
//****************************************************************************************************************************/

module.exports.IncomesSearchTransactions = async (req, res) => {
  try {
    const { name } = req.query;
    const { currency } = await userModels.findOne({ _id: req.user._id })

    let result = await TransactionModel.findOne({
      user_id: req.user._id,
    });
    const arr = [];
    result.transactions.map((vel) => {
      if (vel.type == "0") {
        arr.push(vel);
      }
    });
    const data = arr.filter(({ contact_name }) => contact_name.includes(name))
    if (data) {
      const updatedData = await Promise.all(data?.map(async (data) => {
        let amounts = data?.amount;
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
          data.convert_amount = res1.result;
          return data;
        }
      }));
    }
    res.status(200).send({
      status: true,
      message: "success",
      response: data,
    });
  } catch (error) {
    res.status(401).send({
      status: false,
      message: error.message,
    });
  }
};


//*****************************************************************************************************************************/
//generate Transaction Reference //
//****************************************************************************************************************************/



function generateTransactionReference() {
  const date = new Date();
  const timestamp = date.getTime();
  const random = Math.floor(Math.random() * 1000);
  console.log("TXREF-${timestamp}-${random}", `TXREF-${timestamp}-${random}`)
  return `TXREF-${timestamp}-${random}`;
}

//*****************************************************************************************************************************/
//Initiate Card Payment //
//****************************************************************************************************************************/

module.exports.InitiateCardPayment = async (req, res) => {
  try {
    const { amount, card_number, cvv, expiry_month, expiry_year, currency, fullname, email } = req.body;
    const details = {
      "card_number": card_number,
      "cvv": cvv,
      "expiry_month": expiry_month,
      "expiry_year": expiry_year,
      "currency": currency,
      "amount": amount,
      "email": email,
      "fullname": fullname,
      "tx_ref": generateTransactionReference(),
      "redirect_url": "http://localhost:3000/success",
      "enckey": "FLWSECK_TEST9a71df4a0289",
    };
    const data = await flw.Charge.card(details)
    return res.status(200).send({
      data: data,
    });
  }
  catch (err) {
    res.status(401).send({
      status: false,
      message: err.message,
      stack: err.stack,
    });
  }

}

//*****************************************************************************************************************************/
//Authorize Card Payment //
//****************************************************************************************************************************/

module.exports.AuthorizeCardPayment = async (req, res) => {
  try {
    const { amount, card_number, cvv, expiry_month, expiry_year, currency, fullname, email, pin, city, address, state, country, zipcode, mode } = req.body;
    if (mode == "pin") {
      const details = {
        "card_number": card_number,
        "cvv": cvv,
        "expiry_month": expiry_month,
        "expiry_year": expiry_year,
        "currency": currency,
        "amount": amount,
        "email": email,
        "fullname": fullname,
        "tx_ref": generateTransactionReference(),
        "redirect_url": "http://localhost:3000/success",
        "authorization": {
          "mode": "pin",
          "pin": pin
        },
        "enckey": "FLWSECK_TEST9a71df4a0289",
      };
      const data = await flw.Charge.card(details)
      return res.status(200).send({
        response: data,
      });
    }
    if (mode == "avs_noauth") {
      console.log("avs_noauth")
      const details = {
        "card_number": card_number,
        "cvv": cvv,
        "expiry_month": expiry_month,
        "expiry_year": expiry_year,
        "currency": currency,
        "amount": amount,
        "email": email,
        "fullname": fullname,
        "tx_ref": generateTransactionReference(),
        "redirect_url": "http://localhost:3000/success",
        "authorization": {
          "mode": "avs_noauth",
          "city": city,
          "address": address,
          "state": state,
          "country": country,
          "zipcode": zipcode,
        },
        "enckey": "FLWSECK_TEST9a71df4a0289",
      };
      const data = await flw.Charge.card(details)
      return res.status(200).send({
        response: data,
      });
    }
  } catch (err) {
    res.status(401).send({
      status: false,
      message: err.message,
      stack: err.stack,
    });
  }

}
//*****************************************************************************************************************************/
//Verify Card Payment //
//****************************************************************************************************************************/

module.exports.VerifyCardPayment = async (req, res) => {
  try {
    const { otp, flw_ref } = req.body;
    const response = await flw.Charge.validate({
      otp: otp,
      flw_ref: flw_ref,
    });

    if (response.status == "error") {
      throw new Error("payment error")
    }


    console.log("responseresponse", response)
    if (response.data.status == "successful") {
      const wallet = await WalletModel.findOne({ user_id: req.user._id })
      const updatedbalance = wallet?.balance + parseInt(response.data.amount)
      const wallets = await WalletModel.findOneAndUpdate(
        { user_id: req.user._id },
        { $set: { balance: updatedbalance } },
        { new: true }
      )
      return res.status(200).send({
        message: "payment-successful",
        data: response,
      });
    } else if (response.data.status == "pending") {
      // Schedule a job that polls for the status of the payment every 10 minutes
      transactionVerificationQueue.add({
        id: response.data.id,
      });
      return res.status(200).send({
        message: "payment-processing",
        data: response,
      });
    } else {
      return res.status(401).send({
        message: "payment-failed",
      });
    }
  } catch (err) {
    res.status(401).send({
      status: false,
      message: err.message,
      stack: err.stack,
    });
  }

}