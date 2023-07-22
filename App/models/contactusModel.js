const mongoose = require("mongoose");

const contactusModel = new mongoose.Schema(
    {
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        name: {
            type: String,
        },
        email: {
            type: String,
        },
        message: {
            type: String,
        },
        resolved: {
            type: Boolean,
            default: false,
        },
    }
    , {
        timestamps: true
    })


const ContactUsModel = mongoose.model("ContactUsModel", contactusModel);

module.exports = ContactUsModel;