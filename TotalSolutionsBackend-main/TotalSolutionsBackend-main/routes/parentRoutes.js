const express = require("express");
const { User } = require("../models/User");
const { Parent } = require("../models/User");
const Child = require("../models/Child");
const router = express.Router();
const auth = require("../middleware/auth");
const Centre = require("../models/Centre");
const Appointment = require("../models/Appointment");
const IEP = require("../models/IEP");
const {logger} = require("../utils/logger");

router.post("/childinfo", auth, async (req, res) => {
  try {
    if (req.user.role !== "parent") {
      return res.status(403).send("Access Denied");
    }

    const { name, dob, gender, schoolName, schoolBoard, centreNumber } =
      req.body;

    const existingChild = await Child.findOne({ name, dob, centreNumber });
    if (existingChild) {
      return res.status(400).send("Child already exists");
    }

    const parent = await User.findById(req.user._id);
    if (!parent) {
      return res.status(404).send("Parent not found");
    }

    const child = new Child({
      name,
      dob,
      gender,
      schoolName: schoolName || null,
      schoolBoard: schoolBoard || null,
      parentId: parent._id,
      centreNumber,
      admitStatus: "pending", 
    });

    const savedChild = await child.save();
    res.status(201).json(savedChild);
  } catch (err) {
    logger.error(err);
    res.status(500).send("Server Error");
  }
});


router.get("/children", auth, async (req, res) => {
  if (req.user.role !== "parent") {
    return res.status(403).send("Access Denied");
  }

  try {
    const children = await Child.find({ parentId: req.user._id })
      .populate("doctorId", "name email role")
      .populate("centreId", "name address")
      .populate({
        path: "therapies.therapistId",
        select: "name email role",
      });

    res.status(200).json(children);
  } catch (error) {
    logger.error("Backend error:", error.message);
    res.status(500).json({ message: error.message });
  }
});


router.get("/getappointments/:parentId", auth, async (req, res) => {
  if (req.user.role !== "parent") return res.status(403).send("Access Denied");

  try {
    const parentId = req.params.parentId;
    const children = await Child.find({ parentId }).select(
      "_id"
    );
    const childIds = children.map((child) => child._id);

    const appointments = await Appointment.find({ childId: { $in: childIds } })
      .populate({ path: "childId", select: "name dob" })
      .populate({ path: "doctorId", select: "name" })
      .populate({ path: "centreId", select: "name" })
      .sort({ appointmentDate: -1 });
      const parent = await Parent.findById(parentId).select("name");

    res.send({appointments,parentName : parent.name});
  } catch (error) {
    logger.error(error);
    res.status(500).send("Internal server error");
  }
});

router.get("/child/:childId", auth, async (req, res) => {
  if (req.user.role !== "parent") return res.status(401).send("Unauthorized");
  const { childId } = req.params;
  logger.info(`Received childId: ${childId}`);
  if (!childId) return res.status(400).send("Child ID is required");
  try {
    const child = await Child.findById(childId)
      .populate("doctorId", "name")
      .populate({
        path: "therapies.therapistId",
        select: "name",
      })
      .populate("centreId", "name");
    logger.info(`Child found: ${child ? 'true' : 'false'}`);
    logger.info(`Child object: ${JSON.stringify(child)}`);
    if (!child) return res.status(404).send("Child not found");
    res.status(200).send(child);
  } catch (error) {
    logger.error(`Error fetching child details: ${error.message}`);
    res.status(500).send("Server error");
  }
});


router.put("/edit-child-details/:childId", auth, async (req, res) => {
  if (req.user.role !== "parent") return res.status(401).send("Unauthorized");
  const { childId } = req.params;
  if (!childId) return res.status(400).send("Child ID is required");
  try {
    const { name, dob, gender, schoolName, schoolBoard } = req.body;
    const response = await Child.findByIdAndUpdate(childId, {
      name,
      dob,
      gender,
      schoolName,
      schoolBoard,
    });
    if (!response) return res.status(404).send("Child not found");
    res.status(200).send(response);
  } catch (err) {
    res.status(500).send("Interval Server Error");
  }
});

router.get("/iep/:childId", auth, async (req, res) => {
  if (req.user.role !== "parent") return res.status(403).send("Access Denied");
  const { childId } = req.params;
  if (!childId) return res.status(400).send("Child ID is required");
  try {
    const iep = await IEP.find({ childId })
      .sort({ createdAt: -1 })
      .populate("doctorId", "name email role")
      .populate("childId", "name dob gender");
    if (!iep) return res.status(404).send("IEP not found");
    res.status(200).send(iep);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

module.exports = router;
