const jwlUser = require("../models/JWLUser");
const jwlFeedback = require("../models/JWLFeedback");
const otpAuth = require("../middleware/otpAuth");
const OTP = require("../models/OTP");
const jwt = require("jsonwebtoken");
const fileUpload = require("express-fileupload");
const express = require("express");
const router = express.Router();
require("dotenv").config();
const otpGenerator = require("otp-generator");
const sendmail = require("../middleware/mail");
const {logger} = require("../utils/logger");
const path = require("path");
const fs = require("fs");
const { generateUniqueReferenceId } = require("../middleware/reference");
const JWLEnquireQuestion = require("../models/JWLEnquireQuestion");

router.use(fileUpload());
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post("/send-otp", async (req, res) => {
  try {
    const { otpEmail } = req.body;
    if (!otpEmail) {
      return res.status(403).send({
        success: false,
        message: "OTP Email is required",
      });
    }

    let existingUser = await jwlUser.findOne({ parentEmail: otpEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    while (await OTP.findOne({ otp })) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
    }

    const otpPayload = { email: otpEmail, otp };
    const otpBody = await OTP.create(otpPayload);

    const mailBody = `
Dear User,

Your One-Time Password (OTP) for email verification is : ${otp}

Please use this code to complete your enquiry form submission.
This OTP is valid for 5 minutes only.

Best regards,
JoyWithLearning
`;

    try {
      sendmail(otpEmail, `OTP for Email verification`, mailBody);
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Error sending OTP",
        error: err,
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Email Sent\nPlease Provide the OTP within 5 minutes otherwise OTP will be Invalid!!",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "User Enquiry failed",
      error: err,
    });
  }
});

router.post("/verify-email", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(403).send({
        success: false,
        message: "Email is required",
      });
    }

    const existingUser = await jwlUser.findOne({ parentEmail: email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Email is valid",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Email Verification Failed",
    });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(403).json({
        success: false,
        message: "Email or OTP is missing",
      });
    }

    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);

    if (response.length === 0 || otp !== response[0].otp) {
      return res.status(200).json({
        success: false,
        message: "The OTP is not valid",
      });
    }

    const token = jwt.sign({ email: email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({
      success: true,
      message: "User verified successfully",
      token: token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "OTP Verification Failed",
    });
  }
});

router.post("/enquire", otpAuth, async (req, res) => {
  try {
    const {
      childName,
      childAge,
      childGender,
      parentName,
      parentPhoneNo,
      parentEmail,
      preferredCenter,
      videoCall,
      additionalNotes,
    } = req.body;

    const checklist = JSON.parse(req.body.checklist);

    if (
      !childName ||
      !childAge ||
      !childGender ||
      !parentName ||
      !parentPhoneNo ||
      !parentEmail ||
      !preferredCenter ||
      !checklist
    ) {
      return res.status(403).send({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await jwlUser.findOne({ parentEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const referenceId = await generateUniqueReferenceId(jwlUser);

    await jwlUser.create({
      childName,
      childAge,
      parentName,
      parentEmail,
      parentPhoneNo,
      childGender,
      preferredCenter,
      videoCall,
      checklist,
      additionalNotes,
      referenceId,
    });

    const file = req.files.video;
    if (file) {
      const sanitizedEmail = parentEmail.split("@")[0];
      const uploadDir = "/home/totaluploads/jwluploads/";
      const filePath = path.join(uploadDir, `${sanitizedEmail}.mp4`);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      fs.writeFile(filePath, file.data, (err) => {
        if (err) {
          logger.error(err);
          return res.status(500).send({
            success: false,
            message: "Failed to save the file.",
          });
        }
      });
    }

    const mailBody = `
    Dear ${parentName},
    
    Thank you for your enquiry on https://joywithlearning.com. 
    We have received your details and will get back to you shortly.
    
    Your reference ID is: ${referenceId}
    Please keep this for your records.
    
    Regards,
    JoyWithLearning
    `;

    sendmail(parentEmail, "Enquiry Success", mailBody);

    return res.status(200).json({
      success: true,
      message: "Video Uploaded Successfully, Success Email sent",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User Enquiry failed",
    });
  }
});

router.get("/jwlenquirequestions", async (req, res) => {
  try {
    const questions = await JWLEnquireQuestion.find({});
    if (!questions) {
      return res.status(404).json({
        success: false,
        message: "Questions not found",
      });
    }
    return res.status(200).send(questions);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch questions",
    });
  }
});

router.post("/feedback", async (req, res) => {
  const { name, email, feedback } = req.body;
  const existingUser = await jwlFeedback.findOne({ email });
  if (existingUser) {
    return res.json({
      success: false,
      message: "Feedback already given",
    });
  }
  const jwlUserFeedback = await jwlFeedback.create({ name, email, feedback });
  try {
    await jwlUserFeedback.save();
    return res.status(200).json({
      success: true,
      message: "Feedback Saved Successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Feedback Not Saved",
    });
  }
});

module.exports = router;
