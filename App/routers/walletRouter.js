const {
  sendMoney,
  fetchTransactions,
  searchTransactions,
  depositMoney,
  donePayment,
  withdrawalMoney,
  fetchIncomesTransaction,
  fetchExpensesTransaction,
  ExpensesSearchTransactions,
  IncomesSearchTransactions,
  paymentExecute,
  getpayoutMoney,
  transferMoneyFromBank,
  confirmPin,
  InitiateCardPayment,
  AuthorizeCardPayment,
  VerifyCardPayment,
  withdrowAmount,

} = require("../controller/transactionController.js");
const { checkUserAuth } = require("../middlewares/middlewares.js");

module.exports = (app) => {
  let router = require("express").Router();
  var walletControllers = require("../controller/walletController.js");

  //Router........................................................................................




  //  router.post("/addPayment",walletControllers.payment);
  //  router.get("/getUserDetails",walletControllers.getUserDetails);
  router.get("/wallet", checkUserAuth, walletControllers.fetchWallet);
  router.post("/wallet", checkUserAuth, walletControllers.createWallet);
  router.post("/sendMoney", checkUserAuth, sendMoney);
  router.get("/transactions", checkUserAuth, fetchTransactions);
  router.post("/searchTransactions", checkUserAuth, searchTransactions);
  router.get("/success", paymentExecute);
  router.post("/createEventWallet", checkUserAuth, walletControllers.createEventWallet);

  router.post("/depositMoney", depositMoney);
  router.post("/withdrawMoney", checkUserAuth, withdrawalMoney);
  router.get("/donePayment", donePayment);
  //   router.get("/searchTransactions", checkUserAuth, searchTransactions);

  router.post("/getpayoutMoney", checkUserAuth, getpayoutMoney);
  router.post("/transferMoneyFromBank", checkUserAuth, transferMoneyFromBank);
  router.post("/confirmPin", checkUserAuth, confirmPin);


  router.get("/fetchIncomesTransaction", checkUserAuth, fetchIncomesTransaction);
  router.get("/fetchExpensesTransaction", checkUserAuth, fetchExpensesTransaction);
  router.post("/ExpensesSearchTransactions", checkUserAuth, ExpensesSearchTransactions);
  router.post("/IncomesSearchTransactions", checkUserAuth, IncomesSearchTransactions);

  router.post("/InitiateCardPayment", checkUserAuth, InitiateCardPayment);
  router.post("/AuthorizeCardPayment", checkUserAuth, AuthorizeCardPayment);
  router.post("/VerifyCardPayment", checkUserAuth, VerifyCardPayment);
  router.post("/createEventWallet", checkUserAuth, walletControllers.createEventWallet);

  router.post("/withdrowAmount", checkUserAuth, withdrowAmount);


  

  app.use("/", router);
};