let mongoose = require('mongoose')
// Defining Schema
const adminDescriptionModelSchema = new mongoose.Schema({
    description: { type: String },
    title:{type:String}
},
    { timestamps: true }
)
// Model
const AdminDescriptionSchema = mongoose.model("AdminDescription", adminDescriptionModelSchema)
module.exports = AdminDescriptionSchema;