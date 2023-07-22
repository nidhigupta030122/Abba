let mongoose = require("mongoose");

const userSubscriptionSchema = new mongoose.Schema(
  {
    email:{type:String}
  },
  {
    timestamps: true,
  }
);
const UserModel = mongoose.model("userSubscription", userSubscriptionSchema);
module.exports = UserModel;
