const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models/User");
const router = express.Router();
const auth = require("../middleware/auth");
const Centre = require("../models/Centre");
const Parent = require("../models/User").Parent;
const otpAuth = require("../middleware/otpAuth");
const OTP = require("../models/OTP");
const { sendOtpSMS } = require("../middleware/sms");
const { generateUniqueReferenceId } = require("../middleware/reference");
const Feedback = require("../models/Feedback");

require("dotenv").config();

router.get("/allusers", async (req, res) => {
  const users = await User.find({}, { mobilenumber: 1, _id: 0 });
  res.json({ success: true, users });
});

// router.post("/send-otp", async (req, res) => {
//   try {
//     const { mobileNumber } = req.body;
//     if (!mobileNumber) {
//       return res.status(403).send({
//         success: false,
//         message: "Mobile number is required",
//       });
//     }

//     // Generate a random 6-digit OTP
//     const generateOTP = () => {
//       return Math.floor(100000 + Math.random() * 900000).toString();
//     };

//     let otp = generateOTP();
//     // Make sure OTP is unique
//     while (await OTP.findOne({ otp })) {
//       otp = generateOTP();
//     }

//     const otpPayload = { mobilenumber: mobileNumber, otp };
//     const otpBody = await OTP.create(otpPayload);

//     try {
//       await sendOtpSMS(mobileNumber, otp);
//     } catch (err) {
//       return res.status(500).json({
//         success: false,
//         message: "Error sending OTP",
//         error: err,
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message:
//         "Email Sent\nPlease Provide the OTP within 5 minutes otherwise OTP will be Invalid!!",
//     });
//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       message: "User Enquiry failed",
//       error: err,
//     });
//   }
// });

router.post("/send-otp", async (req, res) => {
  try {
    console.log("OTP request received:", req.body);

    return res.status(200).json({
      success: true,
      message: "OTP sent (mock)",
      otp: "123456" // dummy
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/verify-otp", async (req, res) => {
  try {
    const { mobilenumber, otp } = req.body;

    if (otp !== "123456") {
      return res.status(200).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      token: "dummy-token",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "OTP Verification Failed",
    });
  }
});
// router.post("/verify-otp", async (req, res) => {
//   try {
//     const { mobileNumber, otp } = req.body;

//     if (!mobileNumber || !otp) {
//       return res.status(403).json({
//         success: false,
//         message: "Mobile number or OTP is missing",
//       });
//     }

//     const response = await OTP.find({ mobilenumber: mobileNumber }).sort({ createdAt: -1 }).limit(1);

//     if (response.length === 0 || otp !== response[0].otp) {
//       return res.status(200).json({
//         success: false,
//         message: "The OTP is not valid",
//       });
//     }

//     const token = jwt.sign({ mobilenumber: mobileNumber }, process.env.JWT_SECRET, {
//       expiresIn: "1h",
//     });

//     return res.status(200).json({
//       success: true,
//       message: "User verified successfully",
//       token: token,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "OTP Verification Failed",
//     });
//   }
// });

router.post("/parentRegister", async (req, res) => {
  try {
    const {
      password,
      parentName,
      mobilenumber,
      address,
    } = req.body;


    const role = "parent";
    const hashedPassword = await bcrypt.hash(password, 10);

    const name = parentName;

    const referenceId = await generateUniqueReferenceId(Parent);

    const users = new Parent({
      password: hashedPassword,
      role,
      name,
      mobilenumber: String(mobilenumber),
      address,
      referenceId
    });

    try {
      const savedUser = await users.save();
      const userData = savedUser.toObject();
      delete userData.password;


      res.send({ success: true, message: "User saved", userData });
    } catch (err) {
      logger.error(err);
      res.status(400).send({ success: false, message: "User not saved" });
    }
  } catch (err) {
    res.status(400).send({ success: false, message: err.message });
  }
});

// router.post("/login", async (req, res) => {
//   try {
//     const { mobilenumber, password } = req.body;
//     const user = await Parent.findOne({ mobilenumber });
//     if (!user) return res.status(401).send("Mobile number or password is incorrect");

//     const validPass = await bcrypt.compare(password, user.password);
//     if (!validPass) return res.status(400).send("Invalid password");

//     const userData = user.toObject();
//     delete userData.password;
//     const token = jwt.sign({ user: userData }, process.env.JWT_SECRET, {
//       expiresIn: "12h",
//     });

//     return res
//       .status(200)
//       .send({ success: true, token: token, role: user.role });
//   } catch (err) {
//     res.status(400).send({ success: false, message: err.message });
//   }
// });

router.post("/login", async (req, res) => {
  try {
    const { mobilenumber, password } = req.body;

let user = await User.findOne({
  $expr: {
    $eq: [
      { $toString: "$mobilenumber" },
      String(mobilenumber)
    ]
  }
});

if (!user) {
  user = await Parent.findOne({
    $expr: {
      $eq: [
        { $toString: "$mobilenumber" },
        String(mobilenumber)
      ]
    }
  });
}

console.log("👉 Found user:", user);

    if (!user) {
      console.log("❌ USER NOT FOUND");
      return res.status(401).send("Mobile number or password is incorrect");
    }

    console.log("👉 Entered password:", password);
    console.log("👉 Stored hash:", user.password);

    const validPass = await bcrypt.compare(password, user.password);
    console.log("👉 Password match result:", validPass);

    if (!validPass) {
      console.log("❌ PASSWORD WRONG");
      return res.status(400).send("Invalid password");
    }

    const userData = user.toObject();
    delete userData.password;

    const token = jwt.sign({ user: userData }, process.env.JWT_SECRET, {
      expiresIn: "12h",
    });

    return res.status(200).send({
      success: true,
      token,
      role: user.role
    });

  } catch (err) {
    console.log("❌ ERROR:", err);
    res.status(400).send({ success: false, message: err.message });
  }
});

router.post("/contactus", async (req, res) => {
  try {
    const { name, mobilenumber, subject, message } = req.body;
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(mobilenumber)) {
      return res
        .status(400)
        .json({ message: "Mobile number must be 10 digits." });
    }
    let existingUser = await Feedback.findOne({ mobilenumber });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted your feedback. . .",
      });
    }
    await Feedback.create({ name, mobilenumber, subject, message });
    res.status(200).send({ success: true, message: "Feedback saved" });
  } catch (err) {
    res.status(500).send({ success: false, message: "Interneal Server error" });
  }
});

module.exports = router;
