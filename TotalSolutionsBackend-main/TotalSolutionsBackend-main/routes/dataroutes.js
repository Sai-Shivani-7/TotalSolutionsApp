const express = require("express");
const { User } = require("../models/User");
const Child = require("../models/Child");
const Parent = require("../models/User").Parent;
const router = express.Router();
const auth = require("../middleware/auth");
const Centre = require("../models/Centre");
const GamesHome = require("../models/GamesHome");
const Game = require("../models/Game");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { logger } = require("../utils/logger");

const fileUpload = require("express-fileupload");
router.use(fileUpload());

router.get("/allcentres", auth, async (req, res) => {
  if (
    !(
      req.user.role === "admin" ||
      req.user.role === "parent" ||
      req.user.role === "superadmin"
    )
  )
    return res.status(401).send("Unauthorized");
  try {
    const centres = await Centre.find();
    res.send(centres);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/allcentrenames", async (req, res) => {
  try {
    const centres = await Centre.find();
    const cnames = centres.map((centre) => {
      return centre.name;
    });
    res.send(cnames);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/allChildren/:id", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(401).send("Unauthorized");
  }

  try {
    const centreId = req.params.id;
    const centre = await Centre.findById(centreId).populate({
      path: "children",
      populate: { path: "parentId" },
    });

    if (!centre) {
      return res.status(404).send("Centre not found");
    }

    res.send(centre.children);
  } catch (err) {
    res.status(500).send("Server Error: " + err.message);
  }
});

router.get("/parents", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(401).send("Unauthorized");
    }
    const centreId = req.user.centreId;
    const centre = await Centre.findById(centreId);
    if (!centre) {
      return res.status(404).send("Centre not found");
    }
    const uniqueParentIds = [
      ...new Set(centre.parents.map((id) => id.toString())),
    ];
    const parents = await User.find({
      _id: { $in: uniqueParentIds },
      role: "parent",
    }).select("-password");
    res.status(200).json(parents);
  } catch (err) {
    logger.error("Error fetching parents:", err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/alldoctors", auth, async (req, res) => {
  if (
    req.user.role !== "admin" &&
    req.user.role !== "parent" &&
    req.user.role !== "superadmin"
  ) {
    return res.status(401).send("Unauthorized");
  }
  try {
    const doctors = await User.find({ role: "doctor" })
      .select("_id name role centreIds")
      .populate("centreIds", "name");
    res.send(doctors);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/allDoctors/:id", auth, async (req, res) => {
  if (
    req.user.role !== "admin" &&
    req.user.role !== "parent" &&
    req.user.role !== "superadmin"
  ) {
    return res.status(401).send("Unauthorized");
  }
  try {
    const doctors = await Centre.findById(req.params.id).populate({
      path: "doctors",
      select: "-password",
    });
    if (!doctors) {
      return res.status(404).send("Centre not found");
    }
    res.send(doctors);
  } catch (err) {
    logger.error(err);
    res.status(500).send({ error: "Server error", details: err.message });
  }
});

router.get("/allTherapists", auth, async (req, res) => {
  if (
    req.user.role !== "admin" &&
    req.user.role !== "parent" &&
    req.user.role !== "superadmin"
  ) {
    return res.status(401).send("Unauthorized");
  }
  try {
    const therapists = await User.find({ role: "therapist" })
      .select("_id name role centreIds")
      .populate("centreIds", "name");
    res.send(therapists);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/allTherapists/:id", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(401).send("Unauthorized");

  try {
    const doctors = await Centre.findById(req.params.id).populate({
      path: "therapists",
      select: "-password",
    });

    if (!doctors) return res.status(404).send("Centre not found");

    res.send(doctors);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// take userId and return all detials of user except password
router.get("/allUsers/:userId", auth, async (req, res) => {
  // if (req.user.role !== "admin") return res.status(401).send("Unauthorized");
  const { userId } = req.params;
  if (!userId) return res.status(400).send("User ID is required");
  try {
    const user = await User.findById(userId).select(["-password"]);
    if (!user) return res.status(404).send("User not found");
    res.send(user);
  } catch (error) {
    res.status(500).send("Server error " + error.message);
  }
});

router.get("/allgames", async (req, res) => {
  try {
    const games = await GamesHome.find();
    res.send(games);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post("/submitGameDetails/:gameId/:childId", async (req, res) => {
  try {
    const { gameId, childId } = req.params;
    const { tries, timer, status, therapistId, datePlayed } = req.body;
    const game = new Game({
      gameId,
      tries,
      timer,
      status,
      childId,
      therapistId,
      datePlayed,
    });
    await game.save();
    res.status(201).send(game);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/gameReports/:childId", async (req, res) => {
  try {
    const { childId } = req.params;
    let gameReports = await Game.find({ childId }).sort({ datePlayed: -1 });
    // logger.info(gameReports);
    gameReports = await Promise.all(
      gameReports.map(async (game) => {
        const gameId = game.gameId.toString();
        const result = await GamesHome.findOne(
          { "games.gameId": gameId },
          { "games.$": 1 },
        );
        // logger.info(result);
        const gameInfo = result?.games[0];
        // Convert to a plain object before mutation
        game = game.toObject();
        game.name = gameInfo ? gameInfo.name : "Unknown Game";

        return game;
      }),
    );
    // logger.info(gameReports);
    res.status(200).send(gameReports);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/parent/:childId", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(401).send("Unauthorized");
  const { childId } = req.params;
  if (!childId) return res.status(400).send("Child ID is required");
  try {
    const child = await Child.findById(childId);
    if (!child) return res.status(404).send("Child not found");
    res.status(200).send(child);
  } catch (error) {
    res.status(500).send("Server error");
  }
});

router.get("/child/:childId", auth, async (req, res) => {
  try {
    const child = await Child.findById(req.params.childId)
      .select("+dateOfJoining")
      .populate({
        path: "changeHistory.changedBy",
        select: "name role",
      });

    if (!child) {
      return res.status(404).send("Child not found");
    }

    res.status(200).json(child);
  } catch (err) {
    logger.error(err);
    res.status(500).send("Server error");
  }
});

router.put("/updateUser/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (user.role === "parent") {
      const response = await Parent.findByIdAndUpdate(userId, req.body, {
        new: true,
        runValidators: true,
      });
      if (!response) {
        res.status(404).send("User not found");
      }

      res.status(200).send(response);
    } else {
      const response = await User.findByIdAndUpdate(userId, req.body, {
        new: true,
        runValidators: true,
      });
      if (!response) {
        res.status(404).send("User not found");
      }
      res.status(200).send(response);
    }
  } catch (error) {
    res.status(500).send("Server error");
  }
});

router.put("/changePassword/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).send("User not found");
      return;
    }
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).send("Current password and new password are required");
      return;
    }
    const validPass = await bcrypt.compare(currentPassword, user.password);
    if (!validPass) return res.status(400).send("Invalid password");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true, runValidators: true },
    );
    if (!updatedUser) {
      res.status(404).send("User not found");
      return;
    }
    res.status(200).send(updatedUser);
  } catch (error) {
    res.status(500).send("Server error");
  }
});

router.post("/imagecapture/:gameId/:childId", async (req, res) => {
  try {
    const { gameId, childId } = req.params;
    let image = null;
    if (req.files && req.files.image) {
      image = req.files.image;
    }
    if (!image) {
      return res.status(400).send("Image file is required");
    }
    let dateObj = new Date();
    let day = String(dateObj.getDate()).padStart(2, "0");
    let month = String(dateObj.getMonth() + 1).padStart(2, "0");
    let year = dateObj.getFullYear();
    let date = `${day}-${month}-${year}`;
    let time = dateObj.toLocaleTimeString().replace(/:/g, "-");
    let imageName = `${time}.png`;
    let imagePath = `/home/totaluploads/gameCaptures/${gameId}/${childId}/${date}/${imageName}`;
    const imageDir = path.dirname(imagePath);
    if (!fs.existsSync(imageDir)) {
      fs.mkdirSync(imageDir, { recursive: true });
    }
    try {
      fs.writeFileSync(imagePath, image.data);
    } catch (err) {
      logger.error(err);
      return res.status(500).send("Error saving image: " + err.message);
    }
    return res.status(200).send({
      success: true,
      message: "Image saved successfully",
      imageUrl: imagePath,
    });
  } catch (err) {
    res.status(500).send("Server error: " + err.message);
  }
});

// Generic child profile photo upload endpoint for all admins/staff
router.put("/updateChildProfilePhoto/:childId", auth, async (req, res) => {
  try {
    if (!req.files || !req.files.profilePhoto) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { childId } = req.params;
    const file = req.files.profilePhoto;

    // Verify child exists
    const child = await Child.findById(childId);
    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }

    const uploadDir = "/home/totaluploads/childProfilePhotos";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.name);
    const filePath = path.join(uploadDir, `${childId}${ext}`);

    // Delete old profile picture if it exists
    if (child.profilePicture) {
      try {
        const oldPath = child.profilePicture.startsWith("/")
          ? child.profilePicture
          : `/home/totaluploads/childProfilePhotos/${child.profilePicture}`;
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      } catch (unlinkErr) {
        logger.warn("Could not delete old child profile picture:", unlinkErr);
      }
    }

    fs.writeFileSync(filePath, file.data);

    // Update child with new profile photo path
    const updatedChild = await Child.findByIdAndUpdate(
      childId,
      { profilePicture: filePath },
      { new: true },
    );

    res.json({
      success: true,
      profilePhoto: filePath,
      message: "Child profile photo updated successfully",
    });
  } catch (err) {
    logger.error("Child profile photo upload error:", err);
    res
      .status(500)
      .json({ message: "Server error during child profile photo upload" });
  }
});

// User/Therapist profile photo upload endpoint
router.put("/updateProfilePhoto/:userId", auth, async (req, res) => {
  try {
    if (!req.files || !req.files.profilePhoto) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { userId } = req.params;
    const file = req.files.profilePhoto;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const uploadDir = "/home/totaluploads/profilePhotos";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.name);
    const filePath = path.join(uploadDir, `${userId}${ext}`);

    // Delete old profile photo if it exists
    if (user.profilePhoto) {
      try {
        const oldPath = user.profilePhoto.startsWith("/")
          ? user.profilePhoto
          : `/home/totaluploads/profilePhotos/${user.profilePhoto}`;
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      } catch (unlinkErr) {
        logger.warn("Could not delete old profile photo:", unlinkErr);
      }
    }

    fs.writeFileSync(filePath, file.data);

    // Update user with new profile photo path
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePhoto: `${userId}${ext}` },
      { new: true },
    );

    res.json({
      success: true,
      profilePhoto: `${userId}${ext}`,
      message: "Profile photo updated successfully",
    });
  } catch (err) {
    logger.error("Profile photo upload error:", err);
    res
      .status(500)
      .json({ message: "Server error during profile photo upload" });
  }
});

module.exports = router;
