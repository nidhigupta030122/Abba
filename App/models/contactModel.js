const mongoose = require("mongoose");

const contactModel = new mongoose.Schema(
    {
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

        name: {
            type: String,
        },
        email: {
            type: String,
        },
        phoneNumber: {
            type: String,
        },

       type: {
            type: String,
            enum: ["1", "0"],
            //type 1 = real user contact
            //type 0 = fake user contact
        }
    }
    , {
        timestamps: true
    })


const ContactModel = mongoose.model("ContactModel", contactModel);

module.exports = ContactModel;