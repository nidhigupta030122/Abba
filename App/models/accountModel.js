
let mongoose =require('mongoose')
// Defining Schema
const UserSchema = new mongoose.Schema({
 //bankDetails
  accountNumber:{ type: String},
  reaccountNumber:{ type: String},
  ifscCode:{ type: String},
  accountHolderName:{ type: String},
  userId:[{type: mongoose.Schema.Types.ObjectId,ref: "user",}]
  },
{ timestamps: true }
)

// Model
const UserModel = mongoose.model("userAccount", UserSchema)

module.exports=UserModel;