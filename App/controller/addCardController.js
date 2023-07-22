const AddCard = require("../models/addCardModel");
const UserModel = require("../models/userModel");
const stripe = require('stripe')('sk_test_51LXg07SEHo2queORS4zk67gMgTV4YkFpqWDrkpx5DXEAe7ZP8D2kPX1JKxyT9Hx7S78ZmXviKBKweCnkPaQfzbmQ003bcmpPtU');
const cardValidator = require('card-validator');


class addCardController {

    //*****************************************************************************************************************************/
    // create Customur and Add Card  Api  //
    //****************************************************************************************************************************/
    
    
    

     addCard = async (req, res) => {
        try {
            const { card_number, exp_month, exp_year, holderName ,cardType } = req.body;
            let checkcard = await AddCard.findOne({ user_id: req.user._id });

            //check if enetered card number valid  or not

            const card = cardValidator.number(card_number);
            if (card.isValid == false) {
                throw new Error("check your card number");
            }

            //check if enetered card exp year valid  or not

            const expirationYear = cardValidator.expirationYear(exp_year);
            if (expirationYear.isValid == false) {
                throw new Error("check your expiration Year");
            }
           // check if enetered card already exists or not
            let cardExist = checkcard?.cards.find(
                (v) => v.card_number === card_number
            );
            if (cardExist) throw new Error("Card already exists");
            if (!checkcard) {
                const values = {
                    exp_month,
                    exp_year,
                    holderName,
                    card_number,
                    cardType,
                };

                const addcard = await AddCard.create({
                    user_id: req.user._id,
                    cards: [values],
                });
                return res.status(200).json({
                    status: true,
                    message: "Card Added Successfully",
                    response: addcard,
                });

            } else {
                const addcard = await AddCard.findOneAndUpdate(
                    { user_id: req.user._id },
                    {
                        $push: {
                            cards: {
                                card_number,
                                holderName,
                                exp_month,
                                exp_year,
                                cardType,
                            },
                        },
                    },
                    { new: true }
                );
                return res.status(200).json({
                    status: true,
                    message: "Card Add Successfully",
                    response: addcard,
                });
            }
        }
        catch (err) {
            return res.status(401).json({
                status: false,
                message: err.message,
                stack: err.stack,
            });
        }
    }

    /*****************************************************************************************************************************/
    // Fetch All card method  //
    //****************************************************************************************************************************/


    fetchUserCard = async (req, res, next) => {
        try {
            const fetchcard = await AddCard.find({ user_id: req.user._id });
            return res.status(200).json({
                status: true,
                message: "Card Fetch Successfully",
                response: fetchcard,
            })
        } catch (err) {
            return res.status(401).json({
                status: false,
                message: err.message,
            })
        }
    }

    /*****************************************************************************************************************************/
    // Fetch SIngle card method  //
    //****************************************************************************************************************************/

    fetchSingleCard = async (req, res, next) => {
        try {
            const { id } = req.body
            const fetchsiglecard = await AddCard.findOne({ _id: id })
            return res.status(200).json({
                status: true,
                message: "Card fetch successfully",
                response: fetchsiglecard,
            })

        } catch (err) {
            return res.status(401).json({
                status: false,
                message: err.message,
            })
        }
    }

    //*****************************************************************************************************************************/
    // Delete  card Stripe  //
    //****************************************************************************************************************************/

    deleteCard = async (req, res, next) => {
         try {
            const { _id } = req.body;
               const deletedcard = await AddCard.findOneAndUpdate(
                {
                    user_id: req.user._id,
                },
                {
                    $pull: { cards: { _id } },
                },
                { new: true }
            );
            return res.status(200).json({
                status: true,
                message: "Card Deleted Successfully",
                response: deletedcard,
            });
        } catch (err) {
            return res.status(401).json({
                status: false,
                message: err.message,
            })
        }
    }
    
    
    //*****************************************************************************************************************************/
    // update  card Stripe  //
    //****************************************************************************************************************************/

    updateCard = async (req, res, next) => {

        try {
            const { _id, card_number, exp_month, exp_year, holderName ,cardType } = req.body;

            let checkcard = await AddCard.findOne({ user_id: req.user._id });

            const card = cardValidator.number(card_number);
            if (card.isValid == false) {
                throw new Error("check your card number");
            }

            // check if enetered card exp year valid  or not

            const expirationYear = cardValidator.expirationYear(exp_year);
            if (expirationYear.isValid == false) {
                throw new Error("check your expiration Year");
            }
            // check if enetered card already exists or not
             let cardExist = checkcard?.cards.find(
                (v) => v.card_number === card_number && v.exp_year === exp_year
            );
            if (cardExist) throw new Error("Card already exists");
            const edit_card = await AddCard.findOneAndUpdate({ "cards._id": _id },
                {
                    $set: {
                        "cards.$.card_number": card_number,
                        "cards.$.exp_month": exp_month,
                        "cards.$.exp_year": exp_year,
                        "cards.$.holderName": holderName,
                        "cards.$.cardType": cardType,
                    }
                }, { new: true })
            return res.status(200).json({
                status: true,
                message: "Card updated Successfully",
                response: edit_card,
            });
        } catch (err) {
            return res.status(401).json({
                status: false,
                message: err.message,
            })
        }
    }
}

const AddCardController = new addCardController();

module.exports = AddCardController;
