const jwt = require("jsonwebtoken");
const OTP = require("../models/OTP");
require("dotenv").config();

module.exports = async (req, res, next) => {
  const token = req.headers.Authorization || req.get('Authorization');

  if (!token)
    return res.status(401).send({ success: false, message: "Access Denied" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await OTP.deleteMany({ email: verified.email });
    next();
  } catch (err) {
    res.status(400).send({
      success: false,
      message: err,
    });
  }
};