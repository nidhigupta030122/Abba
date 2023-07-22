let mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    social_id:{
      type: String,  
    },
    password: {
      type: String,
    },
    email_otp: {
      type: String,
    },
    phone_otp: {
      type: String,
    },
    otp: {
      type: String,
    },
    pin: {
      type: String,
    },
    countryCode: {
      type: String,
    },
    countryName: {
      type: String,
    },
    wallet_otp: {
      type: String,
    },
    currency: {type: String},
        currencysymbol: {type: String},

    phoneNumber: {
      type: String,
    },
    profile: {
      type: String,
    },

    questions: {
      type: String,
    },

    answers: {
      type: String,
    },
    email_verified: {
      type: Boolean,
      default: false,
    },
    phone_verified: {
      type: Boolean,
      default: false,
    },
    pin_verified: {
      type: Boolean,
      default: false,
    },
    isLoggedIn:{
        type: Boolean,
        default: false
    },

    is_verified: {
      type: String,
      enum: [true, false],
      default: false,
    },

    otp_verified: {
      type: String,
      enum: [true, false],
      default: false,
    },

    que_ans_verified: {
      type: String,
      enum: [true, false],
      defult: false,
    },
    //social....
    // full_name:{ type: String},
    mobile_token: {
      type: String,
    },
    qrCode: {
      type: String,
    },
    social_id: {
      type: String,
    },
    firebase_token: { type: String },
  account_status: {type: Boolean, default: true},
  },
  {
    timestamps: true,
  }
);
const UserModel = mongoose.model("user", userSchema);
module.exports = UserModel;
