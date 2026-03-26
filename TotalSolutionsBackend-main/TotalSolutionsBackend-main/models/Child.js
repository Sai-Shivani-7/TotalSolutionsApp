const mongoose = require("mongoose");
const ChildSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: {
      type: String,
      enum: ["Male", "Female", "Others"],
      required: true,
    },
    registrationId: {
      type: String,
      unique: true,
      index: true,
    },
    caseId: {
      type: String,
      unique: true,
      index: true,
    },
    schoolName: { type: String },
    schoolBoard: {
      type: String,
      enum: ["CBSE", "SSC", "ICSE", "Cambridge (IB)", "NIOS", "Others", ""],
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    therapies: [
      {
        therapyType: { type: String, required: true },
        therapistId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
    centreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Centre",
      required: true,
    },
    reports: [
      {
        type: {
          type: String,
          required: true, // "Case History", "Prescription", etc.
        },
        filePath: {
          type: String,
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    dateOfJoining: {
      type: Date,
      default: null,
    },

    IEPs: [{ type: mongoose.Schema.Types.ObjectId, ref: "IEP" }],
    prescriptionReports: [
      { type: mongoose.Schema.Types.ObjectId, ref: "PrescriptionReport" },
    ],
    appointments: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    ],
    gameReports: [{ type: mongoose.Schema.Types.ObjectId, ref: "Game" }],

    admitStatus: {
      type: String,
      enum: ["pending", "active", "inactive"],
      default: "pending",
    },
    inactiveReason: {
      type: String,
      enum: [
        // Administrative
        "administrative-not-joined-after-registration",
        "administrative-services-on-hold",
        "administrative-timing-not-suitable",

        // Academic
        "academic-school-schedule-conflict",
        "academic-exam-period",

        // Health & Therapy
        "health-medical-reasons",
        "health-therapy-paused",
        "health-weaning-off",
        "health-under-observation",

        // Explicit option
        "other",
      ],
      required: function () {
        return this.admitStatus === "inactive";
      },
    },

    // ================= CHANGE HISTORY (AUDIT LOG) =================
    changeHistory: [
      {
        changes: [
          {
            field: String,
            oldValue: mongoose.Schema.Types.Mixed,
            newValue: mongoose.Schema.Types.Mixed,
          },
        ],
        reason: String,
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        changedByRole: String,
        changedAt: Date,
      },
    ],

    profilePicture: { type: String, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Child", ChildSchema);
