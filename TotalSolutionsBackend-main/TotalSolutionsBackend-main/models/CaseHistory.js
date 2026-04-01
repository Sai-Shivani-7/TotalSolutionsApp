const mongoose = require("mongoose");

const TherapyStartedItem = new mongoose.Schema({
  type: String,
  startedDate: String,
  therapistName: String,
  uploadRef: String,
}, { _id: false });

const DecreasingBehaviourRow = new mongoose.Schema({
  type: String,
  month1: String,
  month2: String,
  month3: String,
}, { _id: false });

const caseHistorySchema = new mongoose.Schema(
  {
    childId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Child",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    demographics: {
      childName: String,
      dob: String,
      dateOfJoining: String,
      therapistName: String,
      centre: String,
      fatherName: String,
      fatherPhone: String,
      fatherWhatsApp: String,
      fatherEmail: String,
      fatherOccupation: String,
      fatherQualifications: String,
      motherName: String,
      motherPhone: String,
      motherWhatsApp: String,
      motherEmail: String,
      motherOccupation: String,
      motherQualifications: String,
      address: String,
      preTherapyVideoRef: String,
      newTherapyAdded: String,
      newTherapyDate: String,
      newTherapistName: String,
      therapyStarted: {
        type: [TherapyStartedItem],
        default: [
          { type: "OT", startedDate: "", therapistName: "", uploadRef: "" },
          { type: "BT", startedDate: "", therapistName: "", uploadRef: "" },
          { type: "RT", startedDate: "", therapistName: "", uploadRef: "" },
          { type: "ST", startedDate: "", therapistName: "", uploadRef: "" },
          { type: "BM", startedDate: "", therapistName: "", uploadRef: "" },
          { type: "Parent Training", startedDate: "", therapistName: "", uploadRef: "" },
        ],
      },
    },
    documentsChecklist: {
      consultationPaper: Boolean,
      previousMedicalDocs: Boolean,
      testReports: Boolean,
      consentForm: Boolean,
      parentConcerns: Boolean,
      parentConcernsText: String,
      therapyChange: Boolean,
      therapistChange: Boolean,
      foodAllergy: Boolean,
    },
    increasingBehaviourPlan: {
      longTermGoal: String,
      shortTermGoals: [
        {
          text: String,
          month1: String,
          month2: String,
          month3: String,
        },
      ],
      materialUsed: String,
      methodsUsed: String,
      parentalInvolvement: String,
      overallFeedback: String,
    },
    decreasingBehaviourPlan: {
      rows: {
        type: [DecreasingBehaviourRow],
        default: [
          { type: "Attention Seeking", month1: "", month2: "", month3: "" },
          { type: "Escape", month1: "", month2: "", month3: "" },
          { type: "Skill Deficit", month1: "", month2: "", month3: "" },
          { type: "Tangible", month1: "", month2: "", month3: "" },
          { type: "Automatic Reinforcement", month1: "", month2: "", month3: "" },
          { type: "Self Stimulation", month1: "", month2: "", month3: "" },
        ],
      },
      rewardsForConsequences: String,
      methodsUsed: String,
      parentalInvolvement: String,
    },
    trialExamination: {
      targetBehaviour: String,
      trials: [
        {
          promptUsed: String,
          maxScore: String,
          achievedScore: String,
        },
      ],
      totalScore: Number,
      percentage: Number,
    },
    visualShapes: {
      childName: String,
      date: String,
    },
    assessmentNotes: {
      cylinderResult: String,
      cubeResult: String,
      rectangleResponse: String,
      therapistNotes: String,
      observationNotes: String,
      recommendations: String,
      assessmentDate: String,
    },
    medicalHistory: {
      presentingComplaints: String,
      referredBy: String,
      generalHistory: String,
      prenatalHistory: String,
      natalHistory: String,
      postnatalHistory: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CaseHistory", caseHistorySchema);
