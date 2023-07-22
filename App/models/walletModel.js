let mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    balance: { type: Number, default: 0 },
        convert_balance: { type: Number, default: 0 },

    customer_id: { type: String },
    account_id: {type: String},
    receipts: [
      { transaction_id: { type: String }, transaction_url: { type: String } },
    ],
  },
  {
    timestamps: true,
  }
);
const WalletModel = mongoose.model("wallet", walletSchema);
module.exports = WalletModel;