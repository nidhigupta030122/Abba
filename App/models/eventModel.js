
// let mongoose =require('mongoose')

// const userSchema = new mongoose.Schema({
//   userId:{type: mongoose.Schema.Types.ObjectId, ref: 'user'},
//   title:{ type: String},
//   eventLastDate:{ type: String},
//   description:{ type: String},
//   chooseAmount:{ type: String},
//   showEvent:{ type: Boolean,default:false},
//   image:{type:String},
//   daysAgo:{type:String},
//   totelAmount :{type: String},
//   percentage:{type:String},
//   totelTransactionAmount:{type:String},

//   currencyAmount: { type: String },

// },
// { 
// timestamps: true
// }
// )
// const userModels = mongoose.model("event", userSchema)
// module.exports=userModels;



let mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  title: { type: String },
  eventLastDate: { type: String },
  description: { type: String },
  chooseAmount: { type: String },
  showEvent: { type: Boolean, default: false },
  image: { type: String },
  daysAgo: { type: String },
  totelAmount: { type: String },
  currencyAmount: { type: String  ,default: "0"},
  totelTransactionAmount:{type:String ,default: "0"},
  percentage: { type: String ,default: "0" },
  
},
  {
    timestamps: true
  }
)
const userModels = mongoose.model("event", userSchema)
module.exports = userModels;