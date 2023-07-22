let mongoose = require("mongoose");

const eventWalletSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    balance: { type: Number, default: 0 },
    convert_balance: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);
const eventWalletModel = mongoose.model("EventWallet", eventWalletSchema);
module.exports = eventWalletModel;