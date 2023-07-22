let mongoose = require('mongoose')
// Defining Schema
const QuestionsSchema = new mongoose.Schema({
    questions: { type: String },
    answers: { type: String },
    status:{ type:Number}
},
    { timestamps: true }
)
// Model
const QuestionSchema = mongoose.model("Questions", QuestionsSchema)
module.exports = QuestionSchema;