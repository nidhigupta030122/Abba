const mongoose = require("mongoose");

const cardSchema = mongoose.Schema({
  card_number: {type:String},
  exp_month: { type: String },
  exp_year: { type: String },
  holderName: { type: String },
  cardType: { type: String },
});

const addCard = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    cards: [cardSchema],
  },
  {
    timestamps: true,
  }
);

const AddCard = mongoose.model("AddCard", addCard);

module.exports = AddCard;