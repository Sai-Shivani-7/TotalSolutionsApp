const express = require("express");
const bcrypt = require("bcryptjs");
const { User } = require("../models/User");
const Child = require("../models/Child");
const Game = require("../models/Game");
const router = express.Router();
const auth = require("../middleware/auth");
const path = require("path");
const fs = require("fs");
const CodeOfConduct = require("../models/CodeOfConduct");
// const Gametrial = require('../models/Gametrial');
const IEP = require("../models/IEP");
const fileUpload = require("express-fileupload");
// Get assigned children for caretaker
router.use(fileUpload());
// router.get('/assigned', auth, async (req, res) => {
//     if (req.user.role !== 'therapist') return res.status(403).send('Access Denied');
//     console.log("Getting assigned children for the therapist ");
//     try {
//         const children = await Child.find({ therapistId: req.user._id }).populate('parentId',"name").populate('therapistId','name').populate('centreId','name').populate('doctorId','name');
//         console.log("the children in therapist are : ",children);
//         res.send(children);
//     } catch (err) {
//         res.status(400).send(err);
//     }
// });
router.get("/assigned", auth, async (req, res) => {
  if (req.user.role !== "therapist") {
    return res.status(403).json({ message: "Access Denied" });
  }

  console.log("Getting assigned children for therapist:", req.user.id);

  try {
    const children = await Child.find({
      therapies: {
        $elemMatch: { therapistId: req.user.id },
      },
    })
      .populate("parentId", "name")
      .populate("centreId", "name")
      .populate("doctorId", "name")
      .populate("therapies.therapistId", "name");

    console.log("Assigned children:", children.length);
    res.status(200).json(children);
  } catch (err) {
    console.error("Assigned children error:", err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/sendgamedata", async (req, res) => {
  const { gameId, tries, timer, status, childId } = req.body;
  try {
    const game = new Game({ gameId, tries, timer, status, childId });
    await game.save();
    res.status(200).send("Game data saved succesfully");
  } catch (err) {
    res.status(400).send(err);
  }
});

// router.put('/feedback/:childId', auth, async (req, res) => {
//     if (req.user.role !== 'therapist') return res.status(403).send('Access Denied');
//     const { childId } = req.params;
//     const { feedback } = req.body;
//     const role = 'therapist';
//     if (!childId) return res.status(400).send('Child ID is required');
//     try {
//         const therapist = await User.findById(req.user._id);
//         if (!therapist) return res.status(404).send('Therapist not found');
//         const name = therapist.name;
//         let feedbackDoc = await Feedback.findOne({ childId });
//         if (!feedbackDoc) {
//             feedbackDoc = new Feedback({ childId, name, role, feedback: [feedback] });
//         } else {
//             feedbackDoc.feedback.push(feedback);
//         }
//         await feedbackDoc.save();
//         res.status(200).send(feedbackDoc);
//     } catch (error) {
//         res.status(500).send('Server error');
//     }
// });

router.get("/childIEP/:childId", async (req, res) => {
  // We can add a check to ensure that both therapists and doctors can access this route
  // if(req.user.role !== 'therapist') return res.status(403).send('Access Denied');
  const { childId } = req.params;
  if (!childId) return res.status(400).send("Child ID is required");
  try {
    const iep = await IEP.find({ childId });
    res.send(iep);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.put("/updateIEPperformance/:childId", auth, async (req, res) => {
  if (req.user.role !== "therapist")
    return res.status(403).send("Access Denied");
  const { childId } = req.params;
  const {
    performance,
    month,
    therapistFeedback,
    iepId,
    videoDescription,
    videoUploadDate,
  } = req.body;

  let file = null;
  if (req.files && req.files.video) {
    file = req.files.video;
  }

  if (!childId || !month || !iepId)
    return res.status(400).send("Missing required fields");

  try {
    const iep = await IEP.findOne({ _id: iepId, childId: childId });
    if (!iep) return res.status(404).send("IEP not found");

    const goalIndex = iep.monthlyGoals.findIndex(
      (goal) => goal.latest && goal.latest.month === month,
    );
    if (goalIndex === -1) return res.status(404).send("Monthly goal not found");

    // Move the current latest to history
    const current = iep.monthlyGoals[goalIndex].latest;
    const currentObj =
      typeof current.toObject === "function"
        ? current.toObject()
        : { ...current };
    let safeVideoUploadDate = null;
    if (file) {
      const uploadDir = `/home/totaluploads/iepuploads/${childId}/${month}-${iep.startingYear}`;
      safeVideoUploadDate = videoUploadDate
        ? videoUploadDate.replace(/:/g, "-")
        : new Date().toISOString().replace(/:/g, "-");
      const filePath = path.join(
        uploadDir,
        `${childId}-${safeVideoUploadDate}.mp4`,
      );
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      try {
        fs.writeFileSync(filePath, file.data);
      } catch (err) {
        logger.error(err);
        return res.status(500).send({
          success: false,
          message: "Failed to save the file.",
        });
      }
    }
    let updateVideo = null;
    if (file || videoDescription || videoUploadDate) {
      updateVideo = {
        videoUrl: file
          ? `/home/totaluploads/iepuploads/${childId}/${month}-${iep.startingYear}/${childId}-${safeVideoUploadDate}.mp4`
          : currentObj.childVideo
            ? currentObj.childVideo.videoUrl
            : undefined,
        videoDescription: videoDescription
          ? videoDescription
          : currentObj.childVideo
            ? currentObj.childVideo.videoDescription
            : undefined,
        videoUploadDate: videoUploadDate
          ? new Date(videoUploadDate)
          : currentObj.childVideo
            ? currentObj.childVideo.videoUploadDate
            : undefined,
      };
    }
    const performanceInputs =
      typeof performance === "string" ? JSON.parse(performance) : performance;
    iep.monthlyGoals[goalIndex].latest = {
      ...currentObj,
      performance: performanceInputs
        ? performanceInputs
        : currentObj.performance,
      therapistFeedback,
      updatedAt: new Date(),
      childVideo: updateVideo ? updateVideo : currentObj.childVideo,
      // Ensure required fields are present
      month: currentObj.month,
      target: currentObj.target,
    };
    await iep.save();
    return res.status(200).send("Performance updated successfully");
  } catch (error) {
    logger.error(error);
    res.status(500).send("Server error");
  }
});

router.put("/:gameId/:childId", auth, async (req, res) => {
  if (req.user.role !== "therapist")
    return res.status(403).send("Access Denied");
  const { tries, timer, status } = req.body;
  const { gameId, childId } = req.params;

  // Validate childId
  if (!childId) return res.status(400).send("Child ID is required");

  try {
    // Verify that the child is assigned to the caretaker
    const child = await Child.findById(childId);
    if (!child) return res.status(404).send("Child not found");
    if (child.therapistId.toString() !== req.user._id.toString()) {
      return res.status(403).send("Different caretaker assigned to the child");
    }

    // Create a new game entry regardless of whether one already exists
    const game = new Game({ gameId, childId, tries, timer, status });
    await game.save();

    // If the game status is completed, update the corresponding game status in the child's document
    if (status) {
      // Always add the gameId to the gamesCompleted array
      child.gameReports.push(game);
      await child.save();
    } else {
      // Remove the gameId from the gamesCompleted array if the game is not completed
      const index = child.gameReports.indexOf(game);
      if (index > -1) {
        child.gameReports.splice(index, 1);
        await child.save();
      }
    }

    res.send(game);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/codeofconduct", async (req, res) => {
  try {
    logger.log("Fetching Code of Conduct data");
    const data = await CodeOfConduct.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new items (for seeding or admin)
router.post("/codeofconduct", async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({
      message: "Title and description are required",
    });
  }
  try {
    const newItem = new CodeOfConduct(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/updateProfilePhoto", auth, async (req, res) => {
  try {
    if (!req.files || !req.files.profilePhoto) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const therapistId = req.user._id;
    const file = req.files.profilePhoto;

    const uploadDir = "/home/totaluploads/profilePhotos";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.name);
    const filePath = path.join(uploadDir, `${therapistId}${ext}`);

    await fs.promises.writeFile(filePath, file.data);

    await User.findByIdAndUpdate(therapistId, {
      profilePhoto: filePath,
    });

    res.json({
      success: true,
      profilePhoto: filePath,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
