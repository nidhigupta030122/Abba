let mongoose = require("mongoose");

const userContactSchema = new mongoose.Schema(
  {
    name:{type:String},
    email:{type:String},
    message:{type:String}
  },
  {
    timestamps: true,
  }
);
const UserModel = mongoose.model("userContact", userContactSchema);
module.exports = UserModel;
