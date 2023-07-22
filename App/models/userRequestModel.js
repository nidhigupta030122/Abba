
let mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected",],
      default: "pending",
    }
  },
  {
    timestamps: true,
  }
);
const userRequestModels = mongoose.model("request", userSchema);
module.exports = userRequestModels;