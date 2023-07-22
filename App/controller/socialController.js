
let UserModel =require('../models/userModel.js')   
let jwt = require('jsonwebtoken')

//SocialSignup................................................................................................................................//
 module.exports.Socialsignup = async(req, res) => {
  const { name,email, mobile_token, social_id } =req.body;
  const user = await UserModel.findOne({ social_id: social_id })
  const users = await UserModel.findOne({ email: email })
  console.log("data",user);
       try{
        if(!users){
        if(user){
          res.status(200).send({ "success":false, "Status": "401", "message": "social_id already exist" })
        }else{
            const data = new UserModel({
              name: name,
                email:email,
                mobile_token : mobile_token,
                social_id:social_id,
                profile:"https://app.africabba.com/upload/"+req.file?.filename,
              })
            await data.save()
            const user = await UserModel.findOne({email:email})
            const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' })
            res.status(200).send({"success":true, "status": "200", "message": "Registration Successfully",data,token})
          }
        }else{
          res.status(401).send({ "success":false, "Status": "401", "message": "email already exist" })
        }
        }catch (error) {
            console.log(error)
            res.status(401).send({ "success":false, "Status": "401", "message": "Unable to Register" })
          }
        }
   //SocialLogin................................................................................................................................// 

   module.exports.socialLogin = async (req, res) => {
    try {
      const { email,social_id } = req.body
      const data = await UserModel.find({$and:[{email:email},{social_id:social_id}]})
      if(data.length ==0){
        res.status(401).send({ "success":false, "status": "401","message": "You Does't User Please First Register" })
      }else{
        const datas = await UserModel.findOne({email:email})
        const token = jwt.sign({ userID: datas._id },process.env.JWT_SECRET_KEY, { expiresIn: '5d' })
        res.status(200).send({"success":true, "status": "200", "message": "Login succesfully",data,token})
       }
      }catch(error){
       res.status(401).send({ "success":false, "status": "401","message": "Something Went Wrongs" })
       console.log("err.............=>",error);
      }
    }