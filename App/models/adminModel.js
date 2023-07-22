const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const adminSchema = new mongoose.Schema({

  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  confirmPassword: {
    type: String,
    select: false,
  },
  token: {
    type: String,
  },
  profilePic:{
    type:String
  },
  roll: {
    type: String,
    enum: ["SuperAdmin", "SubAdmin"],
  },
  permission:Array,
  createdAt: {
    type: Date,
    default: Date.now
  },
});


//JWT TOKEN
adminSchema.methods.adminjwtTokken = function () {
  return jwt.sign({ userID: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE
  });
};


module.exports = mongoose.model("admin", adminSchema);
