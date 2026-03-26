const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
    },
    displayInScroller: {
      type: Boolean,
      default: false,
    },
    targetType: {
      type: String,
      enum: ["all", "specific", "public"],
      default: "all",
    },
    targetRoles: {
      type: [String],
      default: [], // e.g., ['parent', 'doctor', 'therapist']
    },
    link: {
      type: String,
      trim: true,
      default: null, // Optional field for announcement links
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

const Announcement = mongoose.model("Announcement", announcementSchema);

module.exports = Announcement;
