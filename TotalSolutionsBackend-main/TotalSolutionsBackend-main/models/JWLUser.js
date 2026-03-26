const mongoose = require("mongoose");

const jwlUserSchema = new mongoose.Schema(
  {
    childName: {
      type: String,
      required: true,
      trim: true,
    },
    childAge: {
      type: Number,
      required: true,
    },
    parentName: {
      type: String,
      required: true,
      trim: true,
    },
    parentEmail: {
      type: String,
      required: true,
      trim: true,
    },
    parentPhoneNo: {
      type: String,
      required: true,
      trim: true,
    },
    childGender: {
      type: String,
      required: true,
      trim: true,
    },
    preferredCenter: {
      type: String,
      required: true,
      trim: true,
    },
    videoCall: {
      type: Boolean,
      required: true,
      trim: true,
      default: false,
    },
    checklist: {
      type: Map,
      of: String,
      required: true,
    },
    enquiryDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    isArchived: {
      type: Boolean,
      required: true,
      default: false,
    },
    additionalNotes: {
      type: String,
      required: false,
      default: "",
    },
    referenceId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("JWLUser", jwlUserSchema);
