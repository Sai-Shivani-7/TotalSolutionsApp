const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const CaseHistory = require("../models/CaseHistory");
const Child = require("../models/Child");
const { logger } = require("../utils/logger");

// ─── POST: Save new case history (one per child) ──────────────────────────
router.post("/", auth, async (req, res) => {
  try {
    console.log("[CaseHistory] incoming payload", JSON.stringify(req.body, null, 2));
    const { childId, demographics, documentsChecklist, increasingBehaviourPlan, decreasingBehaviourPlan, trialExamination, visualShapes, assessmentNotes, medicalHistory } = req.body;

    if (!childId) {
      return res.status(400).json({ message: "Child ID is required" });
    }

    // Verify the child exists
    const child = await Child.findById(childId);
    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }

    // Check if a case history already exists for this child
    const existingHistory = await CaseHistory.findOne({ childId });
    if (existingHistory) {
      return res.status(409).json({ 
        message: "A case history already exists for this child. Please edit the existing one instead.",
        existingHistoryId: existingHistory._id 
      });
    }

    // Create new case history
    const caseHistory = new CaseHistory({
      childId,
      doctorId: req.user._id,
      demographics,
      documentsChecklist,
      increasingBehaviourPlan,
      decreasingBehaviourPlan,
      trialExamination,
      visualShapes,
      assessmentNotes,
      medicalHistory,
    });

    const saved = await caseHistory.save();
    logger.info(`Case history saved for child ${childId} by doctor ${req.user._id}`);
    res.status(201).json(saved);
  } catch (error) {
    logger.error("Error saving case history:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
        errors: error.errors,
      });
    }
    res.status(500).json({ message: error.message });
  }
});

// ─── GET: Fetch case histories for a specific child ───────────────────────
router.get("/child/:childId", auth, async (req, res) => {
  try {
    const { childId } = req.params;

    // Verify the child exists
    const child = await Child.findById(childId);
    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }

    // Fetch all case histories for the child
    const histories = await CaseHistory.find({ childId }).sort({ createdAt: -1 });
    res.status(200).json(histories);
  } catch (error) {
    logger.error("Error fetching case histories:", error);
    res.status(500).json({ message: error.message });
  }
});

// ─── GET: Fetch a specific case history by ID ──────────────────────────────
router.get("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const caseHistory = await CaseHistory.findById(id);
    if (!caseHistory) {
      return res.status(404).json({ message: "Case history not found" });
    }
    res.status(200).json(caseHistory);
  } catch (error) {
    logger.error("Error fetching case history:", error);
    res.status(500).json({ message: error.message });
  }
});

// ─── PUT: Update a case history ────────────────────────────────────────────
router.put("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { demographics, documentsChecklist, increasingBehaviourPlan, decreasingBehaviourPlan, trialExamination, visualShapes, assessmentNotes, medicalHistory } = req.body;

    const caseHistory = await CaseHistory.findById(id);
    if (!caseHistory) {
      return res.status(404).json({ message: "Case history not found" });
    }

    // Update fields
    if (demographics) caseHistory.demographics = demographics;
    if (documentsChecklist) caseHistory.documentsChecklist = documentsChecklist;
    if (increasingBehaviourPlan) caseHistory.increasingBehaviourPlan = increasingBehaviourPlan;
    if (decreasingBehaviourPlan) caseHistory.decreasingBehaviourPlan = decreasingBehaviourPlan;
    if (trialExamination) caseHistory.trialExamination = trialExamination;
    if (visualShapes) caseHistory.visualShapes = visualShapes;
    if (assessmentNotes) caseHistory.assessmentNotes = assessmentNotes;
    if (medicalHistory) caseHistory.medicalHistory = medicalHistory;

    const updated = await caseHistory.save();
    logger.info(`Case history updated for child ${caseHistory.childId}`);
    res.status(200).json(updated);
  } catch (error) {
    logger.error("Error updating case history:", error);
    res.status(500).json({ message: error.message });
  }
});

// ─── DELETE: Delete a case history ────────────────────────────────────────
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const caseHistory = await CaseHistory.findByIdAndDelete(id);
    if (!caseHistory) {
      return res.status(404).json({ message: "Case history not found" });
    }
    logger.info(`Case history deleted: ${id}`);
    res.status(200).json({ message: "Case history deleted successfully" });
  } catch (error) {
    logger.error("Error deleting case history:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
