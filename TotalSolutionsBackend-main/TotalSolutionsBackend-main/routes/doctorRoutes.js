const express = require("express");
const Child = require("../models/Child");
const { User } = require("../models/User");
const auth = require("../middleware/auth");
// const Feedback = require('../models/Feedback');
const Appointment = require("../models/Appointment");
const IEP = require("../models/IEP");
const router = express.Router();
const fs = require("fs");
// const path = require("path");
const fileUpload = require("express-fileupload");
const { logger } = require("../utils/logger");

router.use(fileUpload());

// Get assigned children and caretakers for doctor
router.get("/assigned", auth, async (req, res) => {
  if (req.user.role !== "doctor") return res.status(403).send("Access Denied");

  try {
    const children = await Child.find({ doctorId: req.user._id })
      .populate("centreId", "address city name ")
      .populate("therapies.therapistId", "name");
    children.sort((a, b) => b.createdAt - a.createdAt);
    res.send(children);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Feedback
// router.put('/feedback/:childId', auth, async (req, res) => {
//     if (req.user.role !== 'doctor') return res.status(403).send('Access Denied');
//     const {childId} = req.params;
//     const {feedback} = req.body;
//     const role = 'doctor';
//     if (!childId) return res.status(400).send('Child ID is required');
//     try {
//         const doctor = await User.findById(req.user._id);
//         if (!doctor) return res.status(404).send('Doctor not found');
//         const name = doctor.name;
//         let feedbackDoc = await Feedback.findOne({ childId });
//         if (!feedbackDoc) {
//             feedbackDoc = new Feedback({ childId, name,role, feedback: [feedback] });
//         } else {
//             feedbackDoc.feedback.push(feedback);
//         }
//         await feedbackDoc.save();
//         res.status(200).send(feedbackDoc);
//     } catch (error) {
//         res.status(500).send('Server error');
//     }
// });

router.post("/assignIEP/:childId", async (req, res) => {
  const {
    doctorId,
    therapy,
    therapistName,
    feedback,
    monthlyGoals,
    startingMonth,
    startingYear,
    selectedMonths,
    selectedMonthsNames,
  } = req.body;

  const { childId } = req.params;

  if (
    !doctorId ||
    !therapy ||
    !therapistName ||
    !monthlyGoals ||
    !startingMonth ||
    !startingYear ||
    !selectedMonthsNames
  ) {
    return res.status(400).send("Please provide all the details");
  }

  try {
    const doctor = await User.findById(doctorId);
    if (!doctor) return res.status(404).send("Doctor not found");

    const child = await Child.findById(childId);
    if (!child) return res.status(404).send("Child not found");

    const transformedGoals = monthlyGoals.map((goal) => ({
      latest: { ...goal.latest, updatedAt: new Date() },
      history: [{ ...goal.latest, updatedAt: new Date() }],
    }));

    const iep = new IEP({
      doctorId,
      childId,
      therapy,
      therapistName,
      monthlyGoals: transformedGoals,
      selectedMonths,
      feedback,
      startingMonth,
      startingYear,
      selectedMonthsNames,
    });

    await iep.save();

    child.IEPs.push(iep._id);
    await child.save();

    res.status(201).send(iep);
  } catch (error) {
    logger.error(error);
    res.status(500).send("Server error");
  }
});

router.put("/updateIEP/:childId", async (req, res) => {
  const { childId } = req.params;
  const { iepId, monthlyGoals, monthIndex } = req.body;

  if (!childId || !iepId || monthIndex === undefined || !monthlyGoals) {
    return res.status(400).send("Please provide all the details");
  }

  try {
    const iep = await IEP.findOne({ _id: iepId, childId: childId });
    if (!iep) return res.status(404).send("IEP not found");

    iep.monthlyGoals[monthIndex] = monthlyGoals;

    await iep.save();

    res.status(200).send(iep);
  } catch (error) {
    logger.error(error);
    res.status(500).send(error);
  }
});

router.get("/getAppointments/:doctorId", auth, async (req, res) => {
  if (req.user.role !== "doctor") return res.status(403).send("Access Denied");

  const { doctorId } = req.params;
  if (!doctorId) return res.status(400).send("Doctor ID is required");

  try {
    const appointments = await Appointment.find({
      doctorId,
      status: "approved",
    })
      .populate("childId")
      .populate("doctorId")
      .populate("centreId")
      .sort({ appointmentDate: -1 });

    res.status(200).send(appointments);
  } catch (error) {
    logger.error("Error fetching appointments:", error);
    res.status(500).send(error);
  }
});

router.put("/updateperformance/:childId", auth, async (req, res) => {
  if (req.user.role !== "therapist")
    return res.status(403).send("Access Denied");

  const { childId } = req.params;
  let { performance, month, therapistFeedback, iepId } = req.body;

  // Parse performance if it's a string (from multipart/form-data)
  if (typeof performance === "string") {
    try {
      performance = JSON.parse(performance);
    } catch (e) {
      performance = [];
    }
  }
  // Ensure performance is an array of numbers or empty strings
  if (Array.isArray(performance)) {
    performance = performance.map((v) => (v === "" ? "" : Number(v)));
  } else {
    performance = [];
  }

  if (!childId || !month || !iepId)
    return res.status(400).send("Missing required fields");

  try {
    const iep = await IEP.findOne({ _id: iepId, childId: childId });
    if (!iep) return res.status(404).send("IEP not found");

    const goalIndex = iep.monthlyGoals.findIndex(
      (g) => g.latest && g.latest.month === month,
    );

    if (goalIndex === -1) return res.status(404).send("Monthly goal not found");

    // Move the current latest to history
    const current = iep.monthlyGoals[goalIndex].latest;
    const currentObj =
      typeof current.toObject === "function"
        ? current.toObject()
        : { ...current };

    // Update latest
    iep.monthlyGoals[goalIndex].latest = {
      ...currentObj,
      performance,
      therapistFeedback,
      updatedAt: new Date(),
      // Ensure required fields are present
      target: currentObj.target,
      month: currentObj.month,
    };

    // Update latest record in history. Don't push a new one
    const historyIndex = iep.monthlyGoals[goalIndex].history.findIndex(
      (g) => g.month === month,
    );
    if (historyIndex !== -1) {
      iep.monthlyGoals[goalIndex].history[historyIndex] = {
        ...currentObj,
        performance,
        therapistFeedback,
        updatedAt: new Date(),
        // Ensure required fields are present
        target: currentObj.target,
        month: currentObj.month,
      };
    }

    await iep.save();
    return res.status(200).send("Performance updated successfully");
  } catch (error) {
    logger.error(error);
    res.status(500).send("Server error");
  }
});

router.put("/IEPfeedback/:childId", auth, async (req, res) => {
  const { childId } = req.params;
  const { doctorFeedback, month, iepId } = req.body;

  if (!childId || !month || !iepId)
    return res.status(400).send("Missing required fields");

  try {
    const iep = await IEP.findOne({ _id: iepId, childId: childId });
    if (!iep) return res.status(404).send("IEP not found");

    const goalIndex = iep.monthlyGoals.findIndex(
      (g) => g.latest && g.latest.month === month,
    );

    if (goalIndex === -1) return res.status(404).send("Monthly goal not found");

    const current = iep.monthlyGoals[goalIndex].latest;

    iep.monthlyGoals[goalIndex].latest = {
      ...current.toObject(),
      doctorFeedback,
      updatedAt: new Date(),
    };

    const historyIndex = iep.monthlyGoals[goalIndex].history.findIndex(
      (g) => g.month === month,
    );

    if (historyIndex !== -1) {
      iep.monthlyGoals[goalIndex].history[historyIndex] = {
        ...current.toObject(),
        doctorFeedback,
        updatedAt: new Date(),
      };
    }
    // logger.info(iep);
    await iep.save();
    res.status(200).send("Feedback added successfully");
  } catch (err) {
    logger.error(err);
    res.status(500).send("Server error");
  }
});

router.get("/childIEP/:childId", async (req, res) => {
  // We can add a check to ensure that both therapists and doctors can access this route

  const { childId } = req.params;
  if (!childId) return res.status(400).send("Child ID is required");
  try {
    const ieps = await IEP.find({ childId })
      .populate({
        path: "doctorId",
        select: "name",
      })
      .populate({
        path: "childId",
        select: "name dob gender",
        populate: { path: "centreId", select: "name address city" },
      });
    if (!ieps || ieps.length === 0)
      return res.status(404).send("No IEP found for this child");

    res.status(200).send(ieps);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/getIEPVideo/:videoPath", async (req, res) => {
  try {
    let videoId = req.params.videoPath;

    if (!fs.existsSync(videoId)) {
      return res.status(404).send("Video not found");
    }

    res.status(200).sendFile(videoId);
  } catch (error) {
    logger.error("Error serving video:", error);
    res.status(500).send("Error serving video");
  }
});

module.exports = router;
