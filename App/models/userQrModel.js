const mongoose = require("mongoose");
const qrCodeSchema = new mongoose.Schema({
    userId:{type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    qrCode:{type:Array}
},
{ 
    timestamps: true
}
    );

module.exports = mongoose.model("qrCode", qrCodeSchema);
