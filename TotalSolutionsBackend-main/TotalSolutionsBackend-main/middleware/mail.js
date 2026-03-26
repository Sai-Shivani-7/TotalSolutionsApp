const nodemailer = require("nodemailer");
require("dotenv").config();
const sendmail = (parentEmail, subject, text) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use true for port 465, false for all other ports
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
  });

  const mailOptions = {
    from: `"JoyWithLearning" <${process.env.NODEMAILER_USER}>`,
    to: parentEmail,
    subject: subject,
    text: text,
  };

  const mailres = transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return {
        success: false,
        message: error,
      };
    }
    return {
      success: true,
      message: "Operation Success",
    };
  });
  return mailres;

};
module.exports =  sendmail ;
