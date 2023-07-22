let mongoose = require('mongoose')
// Defining Schema
const NotificationSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    invitation_id : {type: mongoose.Schema.Types.ObjectId, ref: "request"},
    event_id:{type: mongoose.Schema.Types.ObjectId, ref: "event"},
    title: { type: String },
    description: { type: String },
    status: { type: String },
    read_status: {
        type: String,
        enum: [true, false],
        default: false,
    },
        daysAgo: { type: String },

},
    { timestamps: true }
)
// Model
const notificationSchema = mongoose.model("Notification", NotificationSchema)
module.exports = notificationSchema;