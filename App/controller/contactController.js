const contactModel = require("../models/contactModel");
const ContactUsModel= require("../models/contactusModel");
const userModel = require("../models/userModel");
const ApiFeatures = require("../utils/apifeatures");
const nodemailer = require("nodemailer");
var FCM = require("fcm-node");
var serverKey ="AAAA5a9iCPQ:APA91bGsy7qEkL3Uv70Vn0G4nwUYrg9NA9vYlds36mFzPUb7K0Ps3rLjw8YvFftZkrREEH6WUhViclOHweU9zprXShNStA-Sb8qAX9VjYddv9Qr_y-sgpdgfjiA2bSWAlUZ6WgqR1WZU"; //put your server key here
var fcm = new FCM(serverKey);

class contactController {
    //*****************************************************************************************************************************/
    // create Cotact Api   //
    //****************************************************************************************************************************/
    createContact = async (req, res, next) => {
    try {
      const contactList = req.body.contactList.split(",");
      const user = await userModel.find();

      let newList = contactList.map((p) => {
        let check = user.find((v) => v.phoneNumber === p);
        return check
          ? {
              user_id: check._id,
              name: check.name,
              number: check.phoneNumber,
              email: check.email,
            }
          : false;
      });
      newList = newList.filter((v) => (v ? true : false));

      const result = await contactModel.insertMany(newList);
      // const real_user = [];
      // const fake_user = [];
      // contactList.map((value) => {
      //   let is_contain;
      //    let check = user.find((item) => {
      //     return value.phoneNumber == item.phoneNumber
      //   });
      //   if (is_contain) {
      //     real_user.push(check);
      //   } else {
      //     fake_user.push(value);
      //   }
      // });

      // console.log("real_userreal_userreal_user", real_user);
      // console.log("fake_userfake_userfake_userfake_user", fake_user);

      // real_user.map(async (value) => {
      //   const add_contact = await contactModel.create({
      //     user_id: req.user._id,
      //     name: value.name,
      //     email: value.email,
      //     phoneNumber: value.phoneNumber,
      //     type: "1",
      //   });
      // });

      // fake_user.map(async (value) => {
      //   const add_contact = await contactModel.create({
      //     user_id: req.user._id,
      //     name: value.name,
      //     email: value.email,
      //     phoneNumber: value.phoneNumber,
      //     type: "0",
      //   });
      // });

      return res.status(200).json({
        status: true,
        message: "Contact Add Successfully",
        response: result,
      });
    } catch (err) {
      return res.status(401).json({
        status: false,
        message: err.message,
      });
    }
  };

    //*****************************************************************************************************************************/
    // create Cotact Api   //
    //****************************************************************************************************************************/
  fetchAllContact = async (req, res) => {
    try {
      const { name } = req.query;
      const contactList = req.body.contactList.split(",");
      const list = contactList.map((v) => {
        let check = v.includes("&");
        let data = check ? v.split("&") : ["", v];

        return { name: data[0], phoneNumber: data[1] };
      });
      console.log("list", list);
    
      let fetch_contact = await userModel
        .find()
        .select("_id name profile phoneNumber");

      fetch_contact = fetch_contact.filter((v) => {
        let check = false;
        list.forEach((c) => {
          let { phoneNumber } = c;
          let num = phoneNumber.split(" ").join("");
          let bool = num.includes(v.phoneNumber);
          if (bool) check = true;
        });

        return check;
      });
      fetch_contact = fetch_contact.map((v) => {
        return {
          _id: v._id,
          phoneNumber: v.phoneNumber,
          name: v.name ? v.name : "",
          profile: v.profile ? v.profile : "",
        };
      });

      const newList = list.map((c) => {
        let { name, phoneNumber } = c;
        let check = false;
        let num = phoneNumber.split(" ").join("");
        let bool = fetch_contact.find((v) => num.includes(v.phoneNumber));
        if (bool) check = true;
        return check ? bool : { _id: "", name, phoneNumber, profile: "" };
      });

      let filtered = newList.filter((v) => {
        let check = false;
         if ((v.name && v.name.toLowerCase().includes(name.toLowerCase())) || v.phoneNumber.includes(name)) check = true;
        return check;
      });

      return res.status(200).json({
        status: true,
        message: "Contact fetch successfully",
        Response: name ? filtered : newList,
      });
    } catch (err) {
      return res.status(401).json({
        status: false,
        message: err.message,
        stack: err.stack,
      });
    }
  };

    //*****************************************************************************************************************************/
    // Serch Cotact Api   //
    //****************************************************************************************************************************/

    searchContactNumber = async (req, res, next) => {
        try {
            if (Object.entries(req.query).length === 0) {
                throw new Error("record not found")
            } else {
                const apiFeatures = new ApiFeatures(contactModel.find(), req.query).search().filter()
                let contacts = await apiFeatures.query;
                contacts = await apiFeatures.query.clone();
                return res.status(200).json({
                    status: true,
                    message: "Number fetch successfully",
                    response: contacts,
                })
            }
        } catch (err) {
            return res.status(401).json({
                status: false,
                message: err.message,
            })
        }
    }

    //*****************************************************************************************************************************/
    // Serch Cotact Api   //
    //****************************************************************************************************************************/
      searchName = async (req, res) => {
    try {
      if (Object.entries(req.query).length === 0) {
        throw new Error("record not found");
      } else {
        const apiFeatures = new ApiFeatures(
          contactModel.find(),
          req.query
        ).search();
        let contacts = await apiFeatures.query;
        contacts = await apiFeatures.query.clone();
        return res.status(200).json({
          status: true,
          message: "fetch successfully",
          response: contacts,
        });
      }
    } catch (err) {
      return res.status(401).json({
        status: false,
        message: err.message,
      });
    }
  };

    //*****************************************************************************************************************************/
    //Fetch Real contact Api   //
    //****************************************************************************************************************************/

    fetchRealcontact = async (req, res, next) => {
        try {
            const fetch_contact = await contactModel.aggregate([
                { $match: { "user_id": req.user._id, type: "1" } },
                {
                    $lookup:
                    {
                        from: "users",
                        localField: "phoneNumber",
                        foreignField: "phoneNumber",
                        as: "data"
                    }
                }
            ])
            return res.status(200).json({
                status: true,
                message: "Contact fetch successfully",
                Response: fetch_contact,
            })

        } catch (err) {
            return res.status(401).json({
                status: false,
                message: err.message,
            })
        }
    }
    
  //*****************************************************************************************************************************/
  // Contact Email Form //
  //****************************************************************************************************************************/

  contactEmail = async (req, res, next) => {
    try {
      const { name, email, message } = req.body;
      const contactEmail = await ContactUsModel.create({
        user_id: req.user._id,
        name: name,
        email: email,
        message: message,
      });

      // Sending email
      var transporter = nodemailer.createTransport({
        host: "abbawallet.com",
        port: "465",
        auth: {
          user: "noreply@abbawallet.com",
          pass: "Noreply@ABBA202201",
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: "help@abbawallet.com",
        subject: "Message",
        html: `<section style="float: left; width: 100%; text-align: center; padding: 16px 10px; background: #ddd; box-sizing: border-box;">
        <div style="float:left; width:100%; text-align:left;font-family: Montserrat; font-size: 15px; ">${message}</div>
        <div style="float:left; width:100%; text-align:left;font-family: Montserrat; font-size: 15px; margin-top: 20px; ">
          Thank you,<br>
          ${name}<br>
          ${email}<br>
        </div>
      </section>`,
      };
      if (email) {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error);
          }
        });
      }
      return res.status(200).json({
        status: true,
        message: "Email Send Succesfully",
        response: contactEmail,
      });
    } catch (err) {
      return res.status(401).json({
        status: false,
        message: err.message,
      });
    }
  };


  //*****************************************************************************************************************************/
  //Fetch Contact Us Details Api  //
  //****************************************************************************************************************************/

  fetchcontactdetail = async (req, res, next) => {
    try {
      const fetchcontactdetail = await ContactUsModel.find();
      return res.status(201).json({
        status: true,
        message: "Contact Detail fetched Successfully",
        response: fetchcontactdetail,
      });
    } catch (error) {
      return res.status(500).send({ error: "Failed to retrieve users" });
    }
  };

//*****************************************************************************************************************************/
  //Contact Us Action Button Api  //
  //****************************************************************************************************************************/
  contactusaction = async (req, res, next) => {
    try {
      let id = req.body._id;
      const contact = await ContactUsModel.findOne({ _id: id }).populate(
        "user_id"
      );
      const mobile_token = contact.user_id.mobile_token;

      const action = await ContactUsModel.findById(id);
      if (action.resolved === true) throw new Error("Already true");
      else {
        const contactusaction = await ContactUsModel.findByIdAndUpdate(
          { _id: id },
          {
            $set: {
              resolved: true,
            },
          },
          { new: true }
        );

        var message = {
          //this may vary according to the message type (single recipient, multicast, topic, et cetera)
          to: mobile_token,
          collapse_key: "your_collapse_key",

          notification: {
            title: "Title of your push notification",
            body: "Body of your push notification",
          },
        };

        fcm.send(message, function (err, response) {
          if (err) {
            console.log("Something has gone wrong!");
          } else {
            console.log("Successfully sent with response: ", response);
          }
        });

        return res.status(200).json({
          status: true,
          message: "Contact Us Button Updated Successfully",
          response: contactusaction,
        });
      }
    } catch (error) {
      return res.status(401).json({
        status: false,
        message: error.message,
      });
    }
  };

}

const ContactController = new contactController();
module.exports = ContactController;