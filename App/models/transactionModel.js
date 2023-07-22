const mongoose = require("mongoose");

const arraySchema = new mongoose.Schema(
  {
    payeer_id: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    contact_id: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    event_id: { type: mongoose.Schema.Types.ObjectId, ref: "event" },
    contact_name: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["0", "1"] },
    date: { type: String },
    time: { type: String },
    note: {type:String},
    reference: { type: String },
    convert_amount: { type: String },
    feeCutAmount:{type: Number}

  },
  { timestamps: true }
);

const transactionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  transactions: [arraySchema],
  // type 0  - incomes
  // type 1  - expenses
});

const TransactionModel = mongoose.model("Transaction", transactionSchema);
module.exports = TransactionModel;
