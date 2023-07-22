const nodemailer = require("nodemailer");
const twilio = require("twilio");
// const ejs = require("ejs");
const SendOtp = async (email,number, otp) => {
    // console.log("nnnnnnnnnnnnnnnnnnnnnnnnnnnn",email ,"oooooooooooooooooooo" ,otp)
    
     // Sending Otp to phone number
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const phone_no = process.env.TWILIO_PHONE_NUMBER;
  const client = twilio(accountSid, authToken);

  if (number) {
    await client.messages
      .create({
        body: `Your Otp is ${otp}`,
        from: phone_no,
        to: number,
      })
      .then((message) => console.log(message.sid))
      .done();
  }
    
    
    // var transporter = nodemailer.createTransport({
    //     host: process.env.EMAIL_HOST,
    //     port: process.env.EMAIL_PORT,
    //     auth: {
    //          user: process.env.EMAIL_USER,
    //          pass: process.env.EMAIL_PASS
    //     }
    // });
    // const mailOptions = {
    //     from: process.env.EMAIL_FROM,
    //     to: email,
    //     subject: 'Otp',
    //     html: `<div><h1>${otp}</h1></div>`,
    // };
    // transporter.sendMail(mailOptions, (error, info) => {
    //     if (error) {
    //         return console.log(error);
    //     }
    //     console.log('Otp   sent your email:', info.messageId, info.response);
    //  });
}
   
module.exports = SendOtp;