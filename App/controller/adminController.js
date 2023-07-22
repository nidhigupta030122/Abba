const QuestionModel = require("../models/questionsModel");
const adminModel = require("../models/adminModel");
const sendToken = require("../utils/jwtAdmin");
const bcrypt = require("bcryptjs");
const userModels = require("../models/userModel");
const EventModel = require("../models/eventModel");
const TransactionModel = require("../models/transactionModel");
const adminDescriptionModel=require("../models/adminDescriptionModel")
const moment = require("moment");
const jwt = require("jsonwebtoken")


class adminController {
  creteQuestionAnswer = async (req, res, next) => {
    try {
      const { questions, answers } = req.body;
      const question = await QuestionModel.create({
        questions: questions,
        answers: answers,
        status:0
      });
      return res.status(200).json({
        status: true,
        message: "Question and Answer Created Successfully",
        Response: question,
      });
    } catch (err) {
      return res.status(401).json({
        status: false,
        message: err.message,
      });
    }
  };

  adminSignUp = async (req, res, next) => {
    try {
      const { email, password, roll } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          status: false,
          message: "required email and password",
        })
      } else {
        const admin = await adminModel.findOne({ email: email });
        if (!admin) {
          throw new Error("Please check your email")
        }
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
          return res.status(401).json({
            status: false,
            message: "Invalid email or password",
          })
        } else {
          const token = jwt.sign({ userID: admin._id }, process.env.JWT_SECRET_KEY,
            {
              expiresIn: "5d"
            })
          const adminlogin = await adminModel.findOne({ _id: admin._id })
          return res.status(200).json({
            status: true,
            message: "Admin logged in successfully",
            token: token,
            response: adminlogin,
          })
        }
      }
    }
    catch (err) {
      return res.status(401).json({
        status: false,
        message: err.message,
        stack: err.stack,
      })
    }
  };



  createSubAdmin = async (req, res, next) => {
    try {
      const { name, email, password ,permission} = req.body;
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt)
      const checkemail = await adminModel.findOne({ email: email });
      if (checkemail) {
        throw new Error("Email allready exits")
      }
      const CreateSubAdmin = await adminModel.create({
        name: name,
        email: email,
        password: hashPassword,
        roll: "SubAdmin",
        permission:permission
      });
      return res.status(200).json({
        status: true,
        message: "Sub admin create successfully",
      })
    } catch (err) {
      return res.status(401).json({
        status: false,
        message: err.message,
      })
    }
  }

  updateSubAdmin = async (req, res, next) => {
    try {
      const { _id, name, email, password,permission } = req.body;
      console.log("req.body",req.body);
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt)
      const updateSubAdmin = await adminModel.findOneAndUpdate({ _id: _id }, {
        $set: {
          name: name,
          email: email,
          password: hashPassword,
          roll: "SubAdmin",
          permission:permission
        }
      }, { new: true });
      return res.status(200).json({
        status: true,
        message: "Sub admin updated successfully",
        response: updateSubAdmin,
      })
    } catch (err) {
      return res.status(401).json({
        status: false,
        message: err.message,
      })
    }
  }

  fetchAllSubAdmin = async (req, res, next) => {
    try {
      const { limit, skip ,search,index} = req.query;
    let skips=req.query.skip?req.query.skip:0;
    let limits=req.query.limit?req.query.limit:10;
    let indexs = parseInt(skip) ? parseInt(skips) * parseInt(limits) : 0;
   
    let query = {};
      if (search) {
        query = {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ]
        };
      }
    let count= await adminModel.countDocuments({roll:"SubAdmin",...query})
      const fetchAll = await adminModel.find({ roll: "SubAdmin" ,...query}).select("-password") .limit(parseInt(limits)).skip(parseInt(skips)*(parseInt(limits)));
      const serializedfetchAll = fetchAll.map((fetchAll, index) => {
        return {
          serialNumber: indexs +index+ 1,
          fetchAll,
        };
      });
      return res.status(200).json({
        status: true,
        message: "Sub admin fetch successfully",
        count:count,
        response: serializedfetchAll,
      })
    } catch (err) {
      return res.status(401).json({
        status: false,
        message: err.message,
      })
    }
  }


  fetchSigleSubAdmin = async (req, res, next) => {
    try {
      const fetchSingle = await adminModel.find({ _id: req.body._id });
      return res.status(200).json({
        status: true,
        message: "Sub admin fetch successfully",
        response: fetchSingle,
      })
    } catch (err) {
      return res.status(401).json({
        status: false,
        message: err.message,
      })
    }
  }

  deleteSubAdmin = async (req, res, next) => {
    try {
      const deleteSingle = await adminModel.findByIdAndDelete({ _id: req.body._id });
      return res.status(200).json({
        status: true,
        message: "Sub admin delete successfully",
      })
    } catch (err) {
      return res.status(401).json({
        status: false,
        message: err.message,
      })
    }
  } 
  getAllUsers = async (req, res, next) => {
    try {
      const { limit, skip,search } = req.query;
      let skips=req.query.skip?req.query.skip:0;
      let limits=req.query.limit?req.query.limit:10;
      let query = {};
      if (search) {
        query = {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { countryName: { $regex: search, $options: "i" } },
            { phoneNumber: { $regex: search, $options: "i" } },
            { questions: { $regex: search, $options: "i" } },
            { answers: { $regex: search, $options: "i" } },
            { currency: { $regex: search, $options: "i" } }
          ]
        };
      }
      let count=await userModels.countDocuments(query);
      const Users = await userModels.find(query).limit(parseInt(limits)).skip(parseInt(skips)*(parseInt(limits)));
      return res.status(201).json({
        message: "Users fetched Successfully",
        response: Users,
        count:count,
        status: true,
      });
      console.log(Users);
    } catch (error) {
      return res.status(500).send({ error: "Failed to retrieve users" });
    }
  };

  deleteUserById = async (req, res, next) => {
    try {
      let _id = req.params.id;
      const User = await userModels.findByIdAndDelete(_id);
      if (!User) {
        res.status(404).send({ error: "User not found" });
      } else {
        res.status(201).json({ message: "User deleted successfully" });
      }
    } catch (error) {
      res.status(500).send({ error: "Failed to delete user" });
    }
  };

  getAllEventsForAdmin = async (req, res, next) => {
    try {
      const { limit, skip ,search} = req.query;
    let skips=req.query.skip?req.query.skip:0;
    let limits=req.query.limit?req.query.limit:10;
    let query = {};
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { chooseAmount: { $regex: search, $options: "i" } },
          {
            userId: {
              $in: await userModels.find({
                name: { $regex: search, $options: "i" }
              }).distinct("_id")
            }
          }
        ]
      };
    }
    let count=await userModels.countDocuments(query);
      const Events = await EventModel.find(query).limit(parseInt(limits)).skip(parseInt(skips)*(parseInt(limits))).populate({ path: "userId", select: "name" });
      return res.status(201).json({
        message: "Events fetched Successfully",
        response: Events,
        count:count,
        status: true,
      });
    } catch (error) {
      return res.status(401).json({
        status: false,
        message: error.message,
      });
    }
  };

  viewEventById = async (req, res, next) => {
    try {
      let _id = req.params.id;
      const User = await EventModel.findOne({_id});
      if (!User) {
        res.status(404).send({ error: "User not found" });
      } else {
        res.status(200).json({response:User, message: "User get successfully", status:true});
      }
    } catch (error) {
      res.status(500).send({ error: "Failed to delete user" });
    }
  };
  deleteEventById = (async (req, res, next) => {
    try {
      let id = req.params.id
      const Event = await EventModel.findByIdAndDelete(id);
      if (!Event) {
        res.status(404).send({ error: "Event not found" });
      } else {
        res.status(201).json({ message: "Event deleted successfully" });
      }

    }
    catch (error) {
      res.status(500).send({ error: "" })
    }

  })


  creteQuestionAnswer = async (req, res, next) => {
    try {
      const { questions, answers } = req.body;
      const question = await QuestionModel.create({
        questions: questions,
        answers: answers,
      });
      return res.status(200).json({
        status: true,
        message: "Question and Answer Created Successfully",
        Response: question,
      });
    } catch (err) {
      return res.status(401).json({
        status: false,
        message: err.message,
      });
    }
  };

  getAllQuestionAnswers = async (req, res, next) => {
    try {
      const { limit, skip,search } = req.query;
      let skips=req.query.skip?req.query.skip:0;
      let limits=req.query.limit?req.query.limit:10;
      let indexs = parseInt(skip) ? parseInt(skips) * parseInt(limits) : 0;
      let query = {};
      if (search) {
        query = {
          $or: [
            { questions: { $regex: search, $options: "i" } },
            { answers: { $regex: search, $options: "i" } },
          ]
        };
      }
      let count=await QuestionModel.countDocuments(query);
      const questionAnswers = await QuestionModel.find(query).limit(parseInt(limits)).skip(parseInt(skips)*(parseInt(limits)));
      const serializedquestionAnswers = questionAnswers.map((questionAnswers, index) => {
        return {
          serialNumber: indexs +index+ 1,
          questionAnswers,
        };
      });
      return res.status(201).json({
        message: "Questions and Answers fetched successfully",
        response: serializedquestionAnswers,
        count:count,
        status: true,
      });
    } catch (error) {
      return res.status(401).json({
        status: false,
        message: error.message,
      });
    }
  };

  getOneQuestionAnswers = async (req, res, next) => {
    try {
      let _id = req.params.id;
      const questionAnswer = await QuestionModel.findById(_id);
      if (!questionAnswer) {
        return res.status(404).send({ error: "question and Answer not found" });
      } else {
        return res
          .status(201)
          .json({ message: "Question and Answer get successfully" ,questionAnswer:questionAnswer});
      }
    } catch (error) {
      return res.status(401).json({
        status: false,
        message: error.message,
      });
    }
  };
  deleteQuestionAnswerById = async (req, res, next) => {
    try {
      let _id = req.params.id;
      const questionAnswer = await QuestionModel.findByIdAndDelete(_id);
      if (!questionAnswer) {
        return res.status(404).send({ error: "question and Answer not found" });
      } else {
        return res
          .status(201)
          .json({ message: "Question and Answer deleted successfully" });
      }
    } catch (error) {
      return res.status(401).json({
        status: false,
        message: error.message,
      });
    }
  };
  updateQuestionAnswerById = async (req, res, next) => {
    try {
      let id = req.body._id;
      const { questions, answers } = req.body;
      const userupdate = await QuestionModel.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            questions: questions,
            answers: answers,
          },
        },
        { new: true }
      );
      return res.status(200).json({
        status: true,
        message: "questions Updated Successfully",
        response: userupdate,
      });
    } catch (error) {
      return res.status(401).json({
        status: false,
        message: error.message,
        stack: error.stack,
      });
    }
  };

  getAdminProfileById = async (req, res, next) => {
    try {
      let id=req.body.id;
      const Admin = await adminModel.findById(id)
      if (!Admin) {
        return res.status(401).json({ message: "Admin not found" })
      }
      else {
        return res.status(201).json({ message: "Admin details fetched successfully0", response: Admin, status: true })
      }
    }
    catch (error) {
      return res.status(401).json({ message: error.message, status: false });
    }
  }
  getAdminProfile = async (req, res, next) => {
    try {
      let id=req.user._id;
      const Admin = await adminModel.findById(id)
      if (!Admin) {
        return res.status(401).json({ message: "Admin not found" })
      }
      else {
        return res.status(201).json({ message: "Admin details fetched successfully0", response: Admin, status: true })
      }
    }
    catch (error) {
      return res.status(401).json({ message: error.message, status: false });
    }
  }
//Get user list
getAllUserList = async (req, res, next) => {
  try {
    const { limit, skip ,search} = req.query;
    let skips=req.query.skip?req.query.skip:0;
    let limits=req.query.limit?req.query.limit:10;
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { countryName: { $regex: search, $options: "i" } },
          { phoneNumber: { $regex: search, $options: "i" } },
          { questions: { $regex: search, $options: "i" } },
          { answers: { $regex: search, $options: "i" } },
          { currency: { $regex: search, $options: "i" } }
        ]
      };
    }
    let count=await userModels.countDocuments(query);
    const User = await userModels.find(query).limit(parseInt(limits)).skip(parseInt(skips)*(parseInt(limits))).select("name email phoneNo countryCode phoneNumber currency currencysymbol profile")
    if (!User) {
      return res.status(401).json({ message: "No User found" })
    }
    else {
      return res.status(201).json({ message: "User details fetched successfully", response: User, count:count,status: true })
    }
  }
  catch (error) {
    return res.status(401).json({ message: error.message, status: false });
  }
}

getAllUserListById = async (req, res, next) => {
  try {
     let _id=req.params.id;
    const User = await userModels.findById(_id).select("name email phoneNo countryCode phoneNumber currency currencysymbol profile")
    if (!User) {
      return res.status(401).json({ message: "No user found" })
    }
    else {
      return res.status(201).json({ message: "User fetch successfully", response: User, status: true })
    }
  }
  catch (error) {
    return res.status(401).json({ message: error.message, status: false });
  }
}
  //start with admin add desicritption on the support
  addDesription = async (req, res, next) => {
    try {
       let {description,title}=req.body;
      const Add = await adminDescriptionModel.create({description:description,title:title})
      if (!Add) {
        return res.status(401).json({ message: "Not add description" })
      }
      else {
        return res.status(201).json({ message: "Feedback add successfully", response: Add, status: true })
      }
    }
    catch (error) {
      return res.status(401).json({ message: error.message, status: false });
    }
  }

  editDesription = async (req, res, next) => {
    try {
       let {_id,description,title}=req.body;
      const Add = await adminDescriptionModel.updateOne({ _id: req.body._id },
        { $set: { description: description,title:title }, }
      );
      if (!Add) {
        return res.status(401).json({ message: "Not add description" })
      }
      else {
        return res.status(201).json({ message: "Feedback add successfully", response: Add, status: true })
      }
    }
    catch (error) {
      return res.status(401).json({ message: error.message, status: false });
    }
  }

  getAllDecription = async (req, res, next) => {
    try {
      const { limit, skip } = req.query;
    let skips=req.query.skip?req.query.skip:0;
    let limits=req.query.limit?req.query.limit:10;
    let count= await adminDescriptionModel.countDocuments();
      const getAlldecription = await adminDescriptionModel.find().limit(parseInt(limits)).skip(parseInt(skips)*(parseInt(limits)));
      if (!getAlldecription) {
        return res.status(401).json({ message: "No description found" })
      }
      else {
        return res.status(201).json({ message: "All descritption", response: getAlldecription,count:count, status: true })
      }
    }
    catch (error) {
      return res.status(401).json({ message: error.message, status: false });
    }
  }

  getSingleDecription = async (req, res, next) => {
    try {
   
      const getOnedecription = await adminDescriptionModel.findOne({_id:req.params.id})
      if (!getOnedecription) {
        return res.status(401).json({ message: "No description found" })
      }
      else {
        return res.status(201).json({ message: "All descritption", response: getOnedecription, status: true })
      }
    }
    catch (error) {
      return res.status(401).json({ message: error.message, status: false });
    }
  }

  deleteDescriptionById = async (req, res, next) => {
    try {
       let _id=req.params.id;
      const User = await adminDescriptionModel.findByIdAndDelete(_id)
      if (!User) {
        return res.status(401).json({ message: "No Description found" })
      }
      else {
        return res.status(201).json({ message: "Description delete  successfully", response: User, status: true })
      }
    }
    catch (error) {
      return res.status(401).json({ message: error.message, status: false });
    }
  }
//end decription

  ///////// Update Admin Profile

  // updateAdminProfile = async (req, res) => {
  //   try {
  //     const { name, email } = req.body;
  //     console.log(req)
  //     const userData = await adminModel.findOne({ _id: req.user._id });
  //     console.log("test12121",req.file)
  //     console.log("test2",req.file?.fieldname)
  //     let data="https://18.219.235.165:8000/upload/" + req.file?.fieldname
  //     console.log("object",data)
  //     await adminModel.findByIdAndUpdate(
  //       { _id: req.user._id },
  //       {
  //         $set: {
  //           name: name ? name : userData.name,
  //           email: email ? email : userData.email,
  //           // profilePic:
  //           //   "https://18.219.235.165:8000/upload/" + req.file?.fieldname
  //           //     ? "https://18.219.235.165:8000/upload/" + req.file?.fieldname
  //           //     : "https://18.219.235.165:8000/upload/" + userData.profilePic,
  //           //     // : "https://app.abbawallet.com/upload/" + userData.profilePic,
  //           profilePic:data
  //         },
  //       }
  //     );
  //     const fetchdata = await adminModel.findOne({ _id: req.user._id });
  //     console.log(fetchdata);
  //     return res.status(200).json({
  //       status: true,
  //       message: "Profile Updated Successfully",
  //       response: fetchdata,
  //     });
  //   } catch (err) {
  //     return res.status(401).json({
  //       status: false,
  //       message: err.message,
  //     });
  //   }
  // };

  updateAdminProfile = async (req, res) => {
    try {
      const { name, email } = req.body;
      const userData = await adminModel.findOne({ _id: req.user._id });
      let profilePic  // Default profile picture
  console.log("object",req.file)
      if (req.file) {
        profilePic=req.file.location
      }else{
        profilePic = userData.profilePic;
      }
  console.log("profilePic",profilePic)
      await adminModel.findByIdAndUpdate(
        { _id: req.user._id },
        {
          $set: {
            name: name ? name : userData.name,
            email: email ? email : userData.email,
            profilePic: profilePic,
          },
        }
      );
  
      const fetchdata = await adminModel.findOne({ _id: req.user._id });
  
      return res.status(200).json({
        status: true,
        message: "Profile Updated Successfully",
        response: fetchdata,
      });
    } catch (err) {
      return res.status(401).json({
        status: false,
        message: err.message,
      });
    }
  };
  

  /// Fetch Detail
  fetchdetailforAdmin = async (req, res, next) => {
    try {
      const { user_id } = req.body;
      const admindetails = await adminModel.findOne({ _id: user_id });
      return res.status(200).json({
        status: true,
        response: admindetails,
        message: "Admin Detail Fetch Successfully",
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message,
      });
    }
  };


  ///////ChangePassword/////.....
  changePassword = async (req, res, next) => {
    try {
      const user = await adminModel.findOne({ _id: req.body._id });
      const { oldPassword, newPassword, confirmPassword } = req.body;
      const check = bcrypt.compareSync(oldPassword, user.password);
      if (check) {
        if (newPassword !== confirmPassword) {
          throw new Error("NewPassword & Confirm Password Does not matched");
        }
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(newPassword, salt);

        await adminModel.updateOne({ _id: req.body._id },
          { $set: { password: hashPassword }, }
        );
        const updatepassword = await adminModel.findOne({
          _id: req.body._id,
        });

        return res.status(200).json({
          status: true,
          message: "Password Changed Successfully",
          response: updatepassword,
        });
      } else {
        throw new Error("Please Check Old Password");
      }
    } catch (err) {
      return res.status(401).json({
        status: false,
        message: err.message,
      });
    }
  };

  ///////Count Api.....
  countapi = async (req, res, next) => {
    try {
      const users = await userModels.find().count();
      const events = await EventModel.find().count();
      const questions = await QuestionModel.find().count();
      const transactions = await TransactionModel.find().count();
      const activatedusers = await userModels.find({ account_status: true }).count();
      const deactivatedusers = await userModels.find({ account_status: false }).count();
      return res.status(200).json({
        status: true,
        message: "Count Fetch Successfully",
        response: {
          Users: users,
          Events: events,
          Questions: questions,
          Transactions: transactions,
          ActiveUsers: activatedusers,
          DeactiveUsers: deactivatedusers,
        },
      });
    } catch (err) {
      return res.status(401).json({
        status: false,
        message: err.message,
      });
    }
  };

  ////// Fetch Recent Users
  recentusers = async (req, res, next) => {
    try {
      const recentusers = await userModels.find().sort({ createdAt: -1 }).limit(6);
      return res.status(200).json({
        status: true,
        message: "Recent Users Fetch successfully",
        Response: recentusers,
      });
    } catch (err) {
      return res.status(401).json({
        status: false,
        message: err.message,
      });
    }
  };

  /// List of Deactivated Users
  deactivatedusers = async (req, res, next) => {
    try {
      const deactivatedusers = await userModels.find({ account_status: false });
      return res.status(200).json({
        status: true,
        message: "Deactivated Users Fetch successfully",
        Response: deactivatedusers,
      });
    } catch (err) {
      return res.status(401).json({
        status: false,
        message: err.message,
      });
    }
  };

  ///Update Active/Deactivated users

  updateusers = async (req, res, next) => {
    try {
      let id = req.body.id;
      const user = await userModels.findById(id);
      let userupdate;
      if (user.account_status === true) {
        userupdate = await userModels.findByIdAndUpdate(
          { _id: id },
          {
            $set: {
              account_status: false,
            },
          },
          { new: true }
        );
      }
      else {
        userupdate = await userModels.findByIdAndUpdate(
          { _id: id },
          {
            $set: {
              account_status: true,
            },
          },
          { new: true }
        );
      }
      return res.status(200).json({
        status: true,
        message: "User Updated Successfully",
        response: userupdate,
      });
    } catch (error) {
      return res.status(401).json({
        status: false,
        message: error.message,
        stack: error.stack,
      });
    }
  };

  //*****************************************************************************************************************************/
  //Mapping Graph For Users ////
  //****************************************************************************************************************************/

  mappinggraphinfo = async (req, res, next) => {
    try {
      switch (req.body.key) {
        case "day":
          const started = new Date();
          var hour = started.getHours();

          const totalUsersInDays = await userModels.find({
            createdAt: { $lte: started },
          });
          let todayData = totalUsersInDays.map((date) => {
            if (
              moment(date.createdAt).format("YYYY-MM-DD") ==
              moment(Date.now() - 1 * 24 * 3600 * 1000).format("YYYY-MM-DD")
            ) {
              return date;
            }
          });
          todayData = todayData.filter((data) => {
            return data;
          });
          todayData = todayData.map((value) => {
            return value.createdAt.getHours();
          });
          let data = [];

          // for first 6 hours
          let value1 = todayData.reduce((count, date) => {
            let dummy = 0;
            if (date < 6) {
              dummy = 1;
            }
            return count + dummy;
          }, 0);
          data.push(value1);

          // for 2nd 6 hours

          let value2 = todayData.reduce((count, date) => {
            let dummy = 0;
            if (date >= 6 && date < 12) {
              dummy = 1;
            }
            return count + dummy;
          }, 0);
          data.push(value2);

          // for 3rd 6 hours

          let value3 = todayData.reduce((count, date) => {
            let dummy = 0;
            if (date >= 12 && date < 18) {
              dummy = 1;
            }
            return count + dummy;
          }, 0);
          data.push(value3);

          //  for last 6 hours

          let value4 = todayData.reduce((count, date) => {
            let dummy = 0;
            if (date >= 18 && date < 24) {
              dummy = 1;
            }
            return count + dummy;
          }, 0);
          data.push(value4);

          var array = [
            "12am - 6am",
            "6am - 11:59am",
            "12pm - 6pm",
            "6pm - 11:59pm",
          ];

          return res.status(200).json({
            status: true,
            labels: array,
            datasets: data,
            message: "Daily Details Fetch Successfully",
          });
          break;

        case "week":
          const start = new Date().toDateString();
          const totalUsersInWeek = await userModels
            .find({
              createdAt: {
                $gte: moment(Date.now() - 7 * 24 * 3600 * 1000).format(
                  "YYYY-MM-DD"
                ),
              },
            })
            .sort({ createdAt: 1 });

          const dateArray = await totalUsersInWeek.map((users) =>
            moment(users.createdAt).format("YYYY-MM-DD")
          );
          const filteredArray = dateArray.filter(function (item, pos) {
            return dateArray.indexOf(item) == pos;
          });

          var dataa = [];
          filteredArray.map((dt) => {
            let value = totalUsersInWeek.reduce((count, date) => {
              let dummy = 0;
              if (moment(date.createdAt).format("YYYY-MM-DD") == dt) {
                dummy = 1;
              }
              return count + dummy;
            }, 0);
            dataa.push(value);
          });

          var labels = [];
          filteredArray.map((value) => {
            const date = moment(value).format("ll");
            labels.push(date);
          });
          const date = moment(filteredArray, "YYYY/MM/DD").format("YYYY/MM/DD");

          return res.status(200).json({
            status: true,
            labels: labels,
            dataset: dataa,
            message: "Weekly Details Fetch Successfully",
          });
          break;

        case "month":
          const start1 = new Date().toDateString();
          const totalUsersInMonth = await userModels
            .find({
              createdAt: {
                $gte: moment(Date.now() - 30 * 24 * 3600 * 1000).format(
                  "YYYY-MM-DD"
                ),
              },
            })
            .sort({ createdAt: 1 });

          const dateArray1 = await totalUsersInMonth.map((users) =>
            moment(users.createdAt).format("YYYY-MM-DD")
          );
          const filteredArray1 = dateArray1.filter(function (item, pos) {
            return dateArray1.indexOf(item) == pos;
          });

          var data1 = [];
          filteredArray1.map((dt) => {
            let value1 = totalUsersInMonth.reduce((count, date) => {
              let dummy = 0;
              if (moment(date.createdAt).format("YYYY-MM-DD") == dt) {
                dummy = 1;
              }
              return count + dummy;
            }, 0);
            data1.push(value1);
          });

          var labels = [];
          filteredArray1.map((value) => {
            const date1 = moment(value).format("ll");
            labels.push(date1);
          });
          const date1 = moment(filteredArray1, "YYYY/MM/DD").format(
            "YYYY/MM/DD"
          );

          return res.status(200).json({
            status: true,
            labels: labels,
            dataset: data1,
            message: "Monthly Details Fetch Successfully",
          });
          break;
      }
    } catch (err) {
      return res.status(401).json({
        status: false,
        message: err.message,
      });
    }
  };
 
  getAllTransation = async (req, res, next) => {
    try {
      const { limit, skip } = req.query;
      let skips = req.query.skip ? parseInt(req.query.skip) : 0;
      let limits = req.query.limit ? parseInt(req.query.limit) : 10;
      let count = await TransactionModel.countDocuments();
      const transactions = await TransactionModel.find({}, '_id user_id transactions')
        .limit(limits)
        .skip(skips * limits)
        .populate({
          path: 'user_id',
          model: 'user',
          select: 'name',
        });
  
      // Calculate total profit and count of transactions for each user
      const userTransactionMap = new Map(); // Use a map to store transactions for each user
      transactions.forEach(userTransaction => {
        const {_id, user_id, transactions } = userTransaction;
        
        // Sort transactions based on latest createdAt
        const sortedTransactions = transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        const totalProfit = sortedTransactions.reduce((total, transaction) => {
          const { amount, feeCutAmount } = transaction;
          return total + (amount - feeCutAmount);
        }, 0);
        
        const transactionCount = sortedTransactions.length; // Count of transactions for the user
  
        if (userTransactionMap.has(user_id._id)) {
          const existingData = userTransactionMap.get(user_id._id);
          existingData.totalProfit += totalProfit;
          existingData.transactionCount += transactionCount;
        } else {
          userTransactionMap.set(user_id._id, {
            _id: _id,
            name: user_id.name,
            totalProfit,
            transactionCount,
            latestCreatedAt: sortedTransactions.length > 0 ? sortedTransactions[0].createdAt : null,
            transactions,
          });
        }
      });  
  
      const response = Array.from(userTransactionMap.values()); // Convert map values to an array
  
      return res.status(201).json({
        message: "Transaction fetched Successfully",
        response: response,
        count: count,
        status: true,
      });
    }
    catch (error) {
      return res.status(401).json({
        status: false,
        message: error.message,
      });
    }
  };
  
  getAllTransationById = async (req, res, next) => {
    try {
      let _id=req.params.id;
      const Transaction = await TransactionModel.findById({_id});

      return res.status(201).json({
        message: "Transaction list fetched Successfully",
        response: Transaction,
        status: true,
      });
    } catch (error) {
      return res.status(401).json({
        status: false,
        message: error.message,
      });
    }
  };
  getAllFee = async (req, res, next) => {
    try {
      const { limit, skip } = req.query;
      let skips=req.query.skip?req.query.skip:0;
      let limits=req.query.limit?req.query.limit:10;
      // let count=await TransactionModel.countDocuments()
      // let count = await TransactionModel.countDocuments({ transactions: { $exists: true, $not: { $size: 0 } } });
      const Transaction = await TransactionModel.find().limit(parseInt(limits)).skip(parseInt(skips)*(parseInt(limits)));
      console.log("transaction",Transaction)
      const fees = [];
      let count=0;
      for (const item of Transaction) {
        for (const transaction of item.transactions) {
          const fee = {};
          const cutFeeCharges = transaction.amount - transaction.feeCutAmount;
          const payeerUser = await userModels.findById(transaction.payeer_id, 'name');
          const contactUser = await userModels.findById(transaction.contact_id, 'name');
          fee._id=item._id
          fee.user_id=item.user_id
          fee.date=transaction?.date
          fee.time=transaction?.time
          fee.contact_name=transaction?.contact_name
          fee.note=transaction?.note
          fee.event_id=transaction?.event_id
          fee.payeerUser = payeerUser?.name;
          fee.contactUser = contactUser?.name;
          fee.cutFeeCharges = cutFeeCharges;
          count++;
          fees.push(fee);
        }
      }
  
      return res.status(201).json({
        message: "Fee fetched Successfully",
        response: fees,
        count:count,
        status: true,
      });
    } catch (error) {
      return res.status(401).json({
        status: false,
        message: error.message,
      });
    }
  };
  
  AdminDashboard = async (req, res, next) => {
    try {
     
      let totalTranstation=await TransactionModel.countDocuments()
      let totalUser=await userModels.countDocuments()
      let totalEvents=await EventModel.countDocuments()
      let totalSubAdmin = await adminModel.countDocuments({ roll: "SubAdmin" });
      const totalSubAdminPerMonth = await adminModel.aggregate([
        {
          $match: {
            roll: "SubAdmin"
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m",
                date: "$createdAt"
              }
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: "$_id",
            count: { $sum: "$count" }
          }
        },
        {
          $project: {
            _id: 0,
            month: { $toInt: { $substr: ["$_id", 5, 2] } },
            count: 1
          }
        }
      ]);
      const totalSubAdminPerDay = await adminModel.aggregate([
        {
          $match: {
            roll: "SubAdmin"
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Extract the date in the format YYYY-MM-DD from the createdAt field
            count: { $sum: 1 } // Sum the stars for each day
          }
        },
        {
          $sort: {
            _id: 1 // Sort by day in ascending order
          }
        },
        {
          $project: {
            day: "$_id", // Rename the _id field to day
            count: 1 // Include the count field
          }
        }
      ]);
      const totalEventsPerMonth = await EventModel.aggregate([
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m",
                date: "$createdAt"
              }
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: "$_id",
            count: { $sum: "$count" }
          }
        },
        {
          $project: {
            _id: 0,
            month: { $toInt: { $substr: ["$_id", 5, 2] } },
            count: 1
          }
        }
      ]);
      const  totalEventsPerDay = await EventModel.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Extract the date in the format YYYY-MM-DD from the createdAt field
            count: { $sum: 1 } // Sum the stars for each day
          }
        },
        {
          $sort: {
            _id: 1 // Sort by day in ascending order
          }
        },
        {
          $project: {
            day: "$_id", // Rename the _id field to day
            count: 1 // Include the count field
          }
        }
      ]);
      const totalTransactionPerMonth = await TransactionModel.aggregate([
        {
          $unwind: "$transactions"
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m",
                date: { $toDate: "$transactions.createdAt" }
              }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: {
            _id: 1
          }
        }
      ]);
      const totalTransactionPerDay = await TransactionModel.aggregate([
        {
          $unwind: "$transactions"
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: { $toDate: "$transactions.createdAt" }
              }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: {
            _id: 1
          }
        },
        {
          $project: {
            day: "$_id",
            count: 1
          }
        }
      ]);
      const totalUserPerMonth = await userModels.aggregate([
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m",
                date: "$createdAt"
              }
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: "$_id",
            count: { $sum: "$count" }
          }
        },
        {
          $project: {
            _id: 0,
            month: { $toInt: { $substr: ["$_id", 5, 2] } },
            count: 1
          }
        }
      ]);
      const totalUserPerDay = await userModels.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Extract the date in the format YYYY-MM-DD from the createdAt field
            count: { $sum: 1 } // Sum the stars for each day
          }
        },
        {
          $sort: {
            _id: 1 // Sort by day in ascending order
          }
        },
        {
          $project: {
            day: "$_id", // Rename the _id field to day
            count: 1 // Include the count field
          }
        }
      ]);
      return res.status(201).json({
        message: "Dashboard all records",
        totalTranstation:totalTranstation,
        totalUser:totalUser,
        totalEvents:totalEvents,
        totalSubAdmin:totalSubAdmin,
        totalSubAdminPerMonth:totalSubAdminPerMonth,
        totalSubAdminPerDay:totalSubAdminPerDay,
        totalEventsPerMonth:totalEventsPerMonth,
        totalEventsPerDay:totalEventsPerDay,
        totalTranstationPerMonth:totalTransactionPerMonth,
        totalTranstationPerDay:totalTransactionPerDay,
        totalUserPerMonth:totalUserPerMonth,
        totalUserPerDay:totalUserPerDay,
        status: true,
      });
    } catch (error) {
      return res.status(401).json({
        status: false,
        message: error.message,
      });
    }
  };

}

const AdminController = new adminController();

module.exports = AdminController;
