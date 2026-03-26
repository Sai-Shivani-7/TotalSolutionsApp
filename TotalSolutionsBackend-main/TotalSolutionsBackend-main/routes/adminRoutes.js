const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Child = require("../models/Child");
const jwlUser = require("../models/JWLUser");
const Therapist = require("../models/User").Therapist;
const Parent = require("../models/User").Parent;
const Doctor = require("../models/User").Doctor;
const Admin = require("../models/User").Admin;
const Centre = require("../models/Centre");
const Holiday = require("../models/Calendar");
const path = require("path");
const fs = require("fs");
const Appointment = require("../models/Appointment");
const SlotConfiguration = require("../models/SlotConfiguration");
const createMulter = require("../middleware/fileUpload");
const bcrypt = require("bcryptjs");
const GamesHome = require("../models/GamesHome");
const { User } = require("../models/User");
const IEP = require("../models/IEP");
const { generateUniqueReferenceId } = require("../middleware/reference");
const {
  sendAppointmentSMS,
  sendAppointmentAcknowledge,
} = require("../middleware/sms.js");
const {
  validateSlotBooking,
  getBlockedSlotsByAssessment,
  blockSlotsForAppointment,
  getAssessmentSlotsFromList,
  DEFAULT_TIME_SLOTS,
} = require("../utils/slotUtils");
const { logger } = require("../utils/logger");

require("dotenv").config();
const multer = require("multer");
const uploadProfilePhoto = createMulter({
  destination: "/home/totaluploads/profilePhotos/",
  prefix: "profile",
});

const uploadChildProfilePhoto = createMulter({
  destination: "/home/totaluploads/childProfilePhotos/",
  prefix: "child_profile",
});

// Custom multer for handling both profile photos and reports with different destinations
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "profilePicture") {
      cb(null, "/home/totaluploads/childProfilePhotos/");
    } else if (file.fieldname === "newReports") {
      cb(null, "/home/totaluploads/childReports/");
    } else {
      cb(null, "/home/totaluploads/childProfilePhotos/");
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueSuffix);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = require("path").extname(file.originalname).toLowerCase();
  const allowedTypes = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"];
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Only ${allowedTypes.join(", ")} files are allowed`), false);
  }
};

const editChildMulter = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

router.get("/child/:childId", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(401).send("Unauthorized");

  try {
    const child = await Child.findById(req.params.childId).select(
      "+dateOfJoining",
    );
    if (!child) return res.status(404).send("Child not found");

    res.status(200).json(child);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

router.post(
  "/register",
  auth,
  uploadProfilePhoto.single("profilePhoto"),
  async (req, res) => {
    if (req.user.role !== "admin") return res.status(401).send("Unauthorized");

    try {
      const { centreId, ...userData } = req.body;
      if (req.file) {
        userData.profilePhoto = req.file.path;
      }

      const centre = await Centre.findById(centreId);
      if (!centre) return res.status(404).send("Centre not found");

      let user;

      switch (userData.role) {
        case "therapist":
          user = new Therapist(userData);
          user.password = await bcrypt.hash(user.password, 8);
          await user.save();

          if (!centre.therapists.includes(user._id)) {
            centre.therapists.push(user._id);
            await centre.save();
          }

          return res
            .status(201)
            .json({ message: "Therapist registered", user });

        case "parent":
          let existingParent = await Parent.findOne({
            mobilenumber: userData.mobilenumber,
          });

          if (existingParent) {
            if (!centre.parents.includes(existingParent._id)) {
              centre.parents.push(existingParent._id);
              await centre.save();
            }

            return res.status(200).json({
              message: "Parent already exists",
              user: existingParent,
              isExisting: true,
            });
          }

          user = new Parent(userData);
          user.password = await bcrypt.hash(user.password, 8);
          user.referenceId = await generateUniqueReferenceId(Parent);
          await user.save();

          centre.parents.push(user._id);
          await centre.save();
          if (req.body.childData) {
            let childPayload;
            try {
              childPayload = JSON.parse(req.body.childData);
            } catch (e) {
              return res
                .status(400)
                .json({ message: "Invalid child data format" });
            }
            if (
              !childPayload.name ||
              !childPayload.dob ||
              !childPayload.gender
            ) {
              return res
                .status(400)
                .json({ message: "Missing required child fields" });
            }

            const child = new Child({
              name: childPayload.name,
              dob: childPayload.dob,
              gender: childPayload.gender,
              schoolName: childPayload.schoolName || "",
              schoolBoard: childPayload.schoolBoard || "",
              parentId: user._id,
              centreId: centre._id,
              doctorId: null,
              therapies: [],
            });
            await child.save();
            if (!centre.children.includes(child._id)) {
              centre.children.push(child._id);
              await centre.save();
            }
          }

          return res.status(201).json({
            message: "New parent created",
            user,
            isExisting: false,
          });

        default:
          return res.status(400).send("Invalid role");
      }
    } catch (err) {
      logger.error(err);
      res.status(500).send("Server Error");
    }
  },
);

router.post(
  "/uploadProfilePicture/:childId",
  auth,
  uploadChildProfilePhoto.single("profilePicture"),
  async (req, res) => {
    try {
      if (req.user.role !== "admin")
        return res.status(401).send("Unauthorized");

      const { childId } = req.params;
      const child = await Child.findById(childId);
      if (!child) return res.status(404).send("Child not found");

      if (!req.file) return res.status(400).send("No profile picture uploaded");

      // Delete old profile picture if it exists
      if (child.profilePicture) {
        const oldPath = path.join(
          "/home/totaluploads",
          child.profilePicture.replace("/uploads/", ""),
        );
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      const relativePath = path
        .relative("/home/totaluploads", req.file.path)
        .split(path.sep)
        .join("/");
      child.profilePicture = `/uploads/${relativePath}`;
      await child.save();

      res.status(200).json({
        message: "Profile picture uploaded successfully",
        profilePicture: child.profilePicture,
      });
    } catch (err) {
      logger.error("Error uploading child profile picture:", err);
      res.status(500).send(err.message || "Internal server error");
    }
  },
);

router.post("/addChild", auth, async (req, res) => {
  try {
    if (req.user.role !== "parent" && req.user.role !== "admin") {
      return res
        .status(401)
        .send("Unauthorized: Only parents or admins can add children");
    }

    const { parentId } = req.query;
    const childData = req.body.childData;

    const actualParentId = req.user.role === "parent" ? req.user._id : parentId;

    const parent = await Parent.findById(actualParentId);

    if (!parent) return res.status(404).send("Parent not found");

    const raw = req.body.childData;
    const childPayload = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!childPayload?.centreId) {
      return res.status(400).json({ message: "centreId is required" });
    }
    const child = new Child({
      name: childPayload.name,
      dob: childPayload.dob,
      gender: childPayload.gender,
      schoolName: childPayload.schoolName || "",
      schoolBoard: childPayload.schoolBoard || "",
      parentId: actualParentId,
      centreId: childPayload.centreId,
      doctorId: null,
      therapies: [],
    });
    await child.save();

    if (!parent.children.includes(child._id)) {
      parent.children.push(child._id);
      await parent.save();
    }

    const centre = await Centre.findById(childData.centreId);
    if (centre) {
      if (!centre.children.includes(child._id)) {
        centre.children.push(child._id);
      }
      if (!centre.parents.includes(parent._id)) {
        centre.parents.push(parent._id);
      }
      await centre.save();
    }

    res.status(201).send({
      message: "Child added successfully",
      child,
      parent,
      centre: centre || null,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).send(err.message || "Internal server error");
  }
});

const uploadChildReport = createMulter({
  destination: "/home/totaluploads/childReports/",
  prefix: "childReport",
  allowedTypes: [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"],
  fileSizeLimit: 50,
});

router.post("/addExistingChild", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(401).send("Unauthorized");
    }

    const { parentId, therapies = [], ...rest } = req.body;

    if (!parentId) {
      return res.status(400).json({ message: "Parent ID is required" });
    }

    if (!rest.centreId) {
      return res.status(400).json({ message: "centreId is required" });
    }

    for (const t of therapies) {
      if (!t.therapyType || !t.therapistId) {
        return res.status(400).json({
          message: "Each therapy must have therapyType and therapistId",
        });
      }
    }

    const child = new Child({
      ...rest,
      parentId,
      therapies,
      doctorId: rest.doctorId || null,
    });

    await child.save();

    if (child.doctorId) {
      await Doctor.findByIdAndUpdate(child.doctorId, {
        $addToSet: { patients: child._id },
      });
    }
    for (const t of therapies) {
      await Therapist.findByIdAndUpdate(t.therapistId, {
        $addToSet: { assignedChildren: child._id },
      });
    }
    await Parent.findByIdAndUpdate(
      parentId,
      { $addToSet: { children: child._id } },
      { new: true },
    );

    const centre = await Centre.findById(rest.centreId);
    if (!centre) {
      return res.status(400).json({ message: "Centre not found" });
    }

    if (!centre.children.includes(child._id)) {
      centre.children.push(child._id);
    }

    if (!centre.parents.includes(parentId)) {
      centre.parents.push(parentId);
    }

    await centre.save();

    res.status(201).json({
      message: "Child registered successfully",
      child,
      centre,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Internal server error",
    });
  }
});

router.put(
  "/edit-child/:childId",
  auth,
  editChildMulter.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "newReports", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(401).send("Unauthorized: Admin access required");
      }

      const { childId } = req.params;
      const child = await Child.findById(childId);
      if (!child) {
        return res.status(404).send("Child not found");
      }

      const parent = await Parent.findById(child.parentId);
      if (!parent) {
        return res.status(404).send("Parent not found");
      }
      const {
        name,
        dob,
        gender,
        admitStatus,
        schoolName,
        schoolBoard,
        caseId,
        registrationId,
        parentName,
        parentMobile,
        parentEmail,
        parentAddress,
        reportsToDelete,
        doctorId,
        reason,
        inactiveReason,
      } = req.body;

      if (admitStatus === "inactive" && !inactiveReason) {
        return res.status(400).json({
          message: "Reason for inactive is required",
        });
      }

      if (!reason || !reason.trim()) {
        return res.status(400).json({
          message: "Reason is required for any update",
        });
      }
      const changes = [];
      const recordChange = (field, oldValue, newValue) => {
        if (oldValue !== newValue) {
          changes.push({
            field,
            oldValue,
            newValue,
          });
        }
      };

      const allowedStatuses = ["pending", "active", "inactive"];

      if (typeof admitStatus === "string" && admitStatus.trim() !== "") {
        if (!allowedStatuses.includes(admitStatus)) {
          return res.status(400).json({
            message: "Invalid admit status",
          });
        }
      }

      const originalChild = child.toObject();
      const isNonEmptyString = (v) => typeof v === "string" && v.trim() !== "";

      let parsedTherapies = [];
      if (req.body.therapies) {
        try {
          parsedTherapies = JSON.parse(req.body.therapies);
        } catch (e) {
          return res.status(400).json({ message: "Invalid therapies format" });
        }
        if (!Array.isArray(parsedTherapies)) {
          return res
            .status(400)
            .json({ message: "Therapies must be an array" });
        }
      }
      const normalizeTherapies = (arr = []) =>
        arr.map((t) => ({
          therapyType: t.therapyType,
          therapistId: String(t.therapistId),
        }));
      if (
        JSON.stringify(normalizeTherapies(originalChild.therapies)) !==
        JSON.stringify(normalizeTherapies(parsedTherapies))
      ) {
        recordChange("therapies", originalChild.therapies, parsedTherapies);
      }

      for (const t of parsedTherapies) {
        if (!t.therapyType || !t.therapistId) {
          return res.status(400).json({
            message: "Each therapy must have therapyType and therapistId",
          });
        }
      }

      const newProfilePictureFile =
        req.files && req.files["profilePicture"]
          ? req.files["profilePicture"][0]
          : null;
      const newReportFiles =
        req.files && req.files["newReports"] ? req.files["newReports"] : [];

      if (admitStatus && admitStatus !== originalChild.admitStatus) {
        recordChange("admitStatus", originalChild.admitStatus, admitStatus);
      }

      if (
        admitStatus === "inactive" &&
        inactiveReason !== originalChild.inactiveReason
      ) {
        recordChange(
          "inactiveReason",
          originalChild.inactiveReason,
          inactiveReason,
        );
      }

      if (isNonEmptyString(name) && name !== originalChild.name) {
        recordChange("name", originalChild.name, name);
      }

      if (
        dob &&
        new Date(dob).toISOString() !== originalChild.dob?.toISOString()
      ) {
        recordChange("dob", originalChild.dob, dob);
      }

      if (isNonEmptyString(gender) && gender !== originalChild.gender) {
        recordChange("gender", originalChild.gender, gender);
      }

      if (
        isNonEmptyString(schoolName) &&
        schoolName !== originalChild.schoolName
      ) {
        recordChange("schoolName", originalChild.schoolName, schoolName);
      }

      if (
        isNonEmptyString(schoolBoard) &&
        schoolBoard !== originalChild.schoolBoard
      ) {
        recordChange("schoolBoard", originalChild.schoolBoard, schoolBoard);
      }

      if (isNonEmptyString(caseId) && caseId !== originalChild.caseId) {
        recordChange("caseId", originalChild.caseId, caseId);
      }

      if (
        isNonEmptyString(registrationId) &&
        registrationId !== originalChild.registrationId
      ) {
        recordChange(
          "registrationId",
          originalChild.registrationId,
          registrationId,
        );
      }

      if (
        req.body.dateOfJoining &&
        new Date(req.body.dateOfJoining).toISOString() !==
          originalChild.dateOfJoining?.toISOString()
      ) {
        recordChange(
          "dateOfJoining",
          originalChild.dateOfJoining,
          req.body.dateOfJoining,
        );
      }

      if (doctorId && String(originalChild.doctorId || "") !== doctorId) {
        recordChange("doctorId", originalChild.doctorId, doctorId);
      }

      // ---- REPORT & FILE CHANGES ----

      // NEW FILES ADDED
      if (Array.isArray(newReportFiles) && newReportFiles.length > 0) {
        recordChange(
          "reports",
          `count:${child.reports.length}`,
          `count:${child.reports.length + newReportFiles.length}`,
        );
      }

      // FILES REMOVED
      if (reportsToDelete) {
        const parsedDeletes = JSON.parse(reportsToDelete);
        if (Array.isArray(parsedDeletes) && parsedDeletes.length > 0) {
          recordChange(
            "reports",
            `count:${child.reports.length}`,
            `count:${child.reports.length - parsedDeletes.length}`,
          );
        }
      }

      // PROFILE PICTURE UPDATED
      if (newProfilePictureFile) {
        recordChange(
          "profilePicture",
          child.profilePicture || "none",
          "updated",
        );
      }

      if (changes.length === 0) {
        return res.status(400).json({
          message: "No changes detected",
        });
      }

      child.changeHistory.push({
        changes,
        reason,
        changedBy: req.user._id,
        changedByRole: req.user.role,
        changedAt: new Date(),
      });

      if (admitStatus) {
        child.admitStatus = admitStatus;
      }

      if (admitStatus === "inactive") {
        child.inactiveReason = inactiveReason;
      } else {
        child.inactiveReason = undefined;
      }

      if (isNonEmptyString(name)) child.name = name;
      if (dob) child.dob = dob;
      if (isNonEmptyString(gender)) child.gender = gender;
      if (isNonEmptyString(schoolName)) child.schoolName = schoolName;
      if (isNonEmptyString(schoolBoard)) child.schoolBoard = schoolBoard;
      if (isNonEmptyString(caseId)) child.caseId = caseId;
      if (isNonEmptyString(registrationId))
        child.registrationId = registrationId;
      if (req.body.dateOfJoining) child.dateOfJoining = req.body.dateOfJoining;
      if (req.body.therapies) {
        child.therapies = parsedTherapies;
      }
      if ("doctorId" in req.body) {
        child.doctorId = doctorId || null;
      }

      if (newProfilePictureFile) {
        if (child.profilePicture) {
          const oldPath = path.join(
            "/home/totaluploads",
            child.profilePicture.replace("/uploads/", ""),
          );
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
        const relativePath = path
          .relative("/home/totaluploads", newProfilePictureFile.path)
          .split(path.sep)
          .join("/");
        child.profilePicture = `/uploads/${relativePath}`;
      } else if (req.body.clearProfilePicture === "true") {
        if (child.profilePicture) {
          const oldPath = path.join(
            "/home/totaluploads",
            child.profilePicture.replace("/uploads/", ""),
          );
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
        child.profilePicture = null;
      } else if (req.body.existingProfilePicturePath) {
        child.profilePicture = req.body.existingProfilePicturePath;
      }

      parent.name = parentName || parent.name;
      parent.mobilenumber = parentMobile || parent.mobilenumber;
      parent.email = parentEmail || parent.email;
      parent.address = parentAddress || parent.address;
      if (reportsToDelete) {
        try {
          const deleteIds = JSON.parse(reportsToDelete);
          const filesToRemove = child.reports.filter((r) =>
            deleteIds.includes(r._id.toString()),
          );
          filesToRemove.forEach((report) => {
            const filename = report.filePath.replace("/uploads/", "");
            const physicalPath = path.join("/home/totaluploads", filename);
            if (fs.existsSync(physicalPath)) {
              fs.unlinkSync(physicalPath);
            }
          });

          child.reports = child.reports.filter(
            (r) => !deleteIds.includes(r._id.toString()),
          );
        } catch (e) {
          logger.error("Error parsing reportsToDelete:", e.message);
        }
      }
      if (newReportFiles && newReportFiles.length > 0) {
        const reportTypes = Array.isArray(req.body.reportTypes)
          ? req.body.reportTypes
          : [req.body.reportTypes];

        newReportFiles.forEach((file, index) => {
          const relativePath = path
            .relative("/home/totaluploads", file.path)
            .split(path.sep)
            .join("/");
          const reportType = reportTypes[index] || "Medical Report";

          child.reports.push({
            type: reportType,
            filePath: `/uploads/${relativePath}`,
            uploadedAt: new Date(),
          });
        });
      }

      await child.save();
      if ("doctorId" in req.body) {
        // Remove child from all doctors first
        await Doctor.updateMany(
          { patients: child._id },
          { $pull: { patients: child._id } },
        );
        if (doctorId) {
          await Doctor.findByIdAndUpdate(doctorId, {
            $addToSet: { patients: child._id },
          });
        }
      }
      if (req.body.therapies) {
        // Remove from all therapists first
        await Therapist.updateMany(
          { assignedChildren: child._id },
          { $pull: { assignedChildren: child._id } },
        );
        // Add to new therapists
        for (const t of parsedTherapies) {
          await Therapist.findByIdAndUpdate(t.therapistId, {
            $addToSet: { assignedChildren: child._id },
          });
        }
      }
      await parent.save();
      res.status(200).json({
        message: "Child and Parent details updated successfully",
        child,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

router.post(
  "/uploadChildReport/:childId",
  auth,
  uploadChildReport.single("report"),
  async (req, res) => {
    try {
      if (req.user.role !== "admin" && req.user.role !== "parent") {
        return res.status(401).send("Unauthorized");
      }
      const { childId } = req.params;
      const { reportType } = req.body;
      logger.info("Uploading the following reports:", { reportType });
      if (!req.file) {
        return res.status(400).send("No file uploaded");
      }
      if (!reportType) {
        return res.status(400).send("Report type is required");
      }
      const child = await Child.findById(childId);
      if (!child) {
        return res.status(404).send("Child not found");
      }
      const path = require("path");
      const relativePath = path
        .relative("/home/totaluploads", req.file.path)
        .split(path.sep)
        .join("/");

      const reportEntry = {
        type: reportType,
        filePath: `/uploads/${relativePath}`,
        uploadedAt: new Date(),
      };

      child.reports.push(reportEntry);
      await child.save();

      res.status(200).json({
        message: "Report uploaded successfully",
        report: reportEntry,
      });
    } catch (err) {
      logger.error("Upload child report error:", err);
      res.status(500).json({
        message: err.message || "Internal server error",
      });
    }
  },
);

router.put("/assign/:childId", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(401).send("Unauthorized");
  }

  const { doctorId, therapistId, therapyType, centreId } = req.body;
  const { childId } = req.params;

  try {
    const child = await Child.findById(childId);
    if (!child) return res.status(404).send("Child not found");

    if (therapistId) {
      if (!therapyType) {
        return res.status(400).json({
          message: "therapyType is required when assigning a therapist",
        });
      }
      const therapist = await Therapist.findById(therapistId);
      if (!therapist) return res.status(404).send("Therapist not found");

      const existing = child.therapies.find(
        (t) => t.therapyType === therapyType,
      );
      if (existing) {
        existing.therapistId = therapistId;
      } else {
        child.therapies.push({
          therapyType,
          therapistId,
        });
      }

      if (!therapist.assignedChildren.includes(childId)) {
        therapist.assignedChildren.push(childId);
      }

      if (centreId) therapist.centreId = centreId;

      await therapist.save();
    }

    if (doctorId) {
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) return res.status(404).send("Doctor not found");

      child.doctorId = doctorId;

      if (!doctor.patients.includes(childId)) {
        doctor.patients.push(childId);
      }

      await doctor.save();
    }

    child.admitStatus = "active";
    await child.save();

    res.send({
      message: "Doctor and/or Therapist assigned successfully",
      child,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).send({
      error: "Server error",
      details: err.message,
    });
  }
});

const upload = createMulter({
  destination: "/home/totaluploads/prescriptions/",
  prefix: "prescription",
});

const uploadReport = createMulter({
  destination: "/home/totaluploads/childReports/",
  prefix: "report",
});

router.post(
  "/bookAppointment",
  uploadReport.single("pdf"),
  auth,
  async (req, res) => {
    const {
      childName,
      childAge,
      parentName,
      parentId,
      dob,
      parentPhoneNo,
      appointmentDate,
      time,
      doctorId,
      schoolName,
      classGrade,
      schoolBoard,
      childConcerns,
      branch,
      gender,
      alternativeNumber,
      address,
      consultationType,
      referredBy,
      centreId,
    } = req.body;

    try {
      let parent;
      if (parentId) {
        parent = await User.findById(parentId);
        if (!parent) return res.status(404).send("Parent not found");
      } else {
        parent = await User.findOne({ mobilenumber: parentPhoneNo });

        if (!parent) {
          parent = new User({
            name: parentName,
            mobilenumber: parentPhoneNo,
            alternativeNumber,
            address,
            role: "parent",
          });
          await parent.save();
        }
      }
      let child;
      child = await Child.findOne({
        name: childName,
        parentId: parent._id,
      });

      if (!child) {
        child = new Child({
          name: childName,
          dob,
          gender,
          schoolName,
          classGrade,
          schoolBoard,
          parentId: parent._id,
          centreId: centreId,
        });
        await child.save();
      }

      const doctor = await Doctor.findById(doctorId);
      if (!doctor || doctor.role !== "doctor") {
        return res.status(404).send("Doctor not found or invalid role");
      }

      const centre = await Centre.findById(centreId);
      if (!centre) return res.status(404).send("Centre not found");

      if (!centre.doctors.includes(doctorId)) {
        return res
          .status(400)
          .send("Doctor is not linked to the specified centre");
      }

      if (!centre.children.includes(child._id)) {
        centre.children.push(child._id);
        await centre.save();
      }

      // Check if parent already has an appointment on this date
      const inputDate = new Date(appointmentDate);
      // Extract date components to avoid timezone issues
      const year = inputDate.getUTCFullYear();
      const month = inputDate.getUTCMonth();
      const day = inputDate.getUTCDate();
      const normalizedDate = new Date(year, month, day);
      const nextDay = new Date(normalizedDate);
      nextDay.setDate(nextDay.getDate() + 1);

      // ----- NEW: check slot configuration for this date -----
      const slotConfig = await SlotConfiguration.findOne({
        doctorId,
        centreId,
        date: normalizedDate,
      });

      if (slotConfig && slotConfig.isOperational === false) {
        return res
          .status(400)
          .send("Doctor is not operational on the selected date");
      }
      if (slotConfig) {
        const availableSlots = slotConfig.availableSlots
          .filter((slot) => !slot.isBlocked)
          .map((slot) => slot.time);
        if (!availableSlots.includes(time)) {
          return res
            .status(400)
            .send("Selected time slot is not available on the chosen date");
        }
      }
      // ----- END NEW -----

      // Find all children of this parent
      const parentChildren = await Child.find({ parentId: parent._id }).select(
        "_id",
      );
      const childIds = parentChildren.map((child) => child._id);

      // Check for existing appointments on the same date for any child of this parent
      const existingParentAppointments = await Appointment.find({
        childId: { $in: childIds },
        appointmentDate: {
          $gte: normalizedDate,
          $lt: nextDay,
        },
        status: { $in: ["pending", "approved"] },
      });

      if (existingParentAppointments.length > 0) {
        const existingAppointment = existingParentAppointments[0];
        const existingChild = await Child.findById(existingAppointment.childId);
        return res
          .status(400)
          .send(
            `You already have an appointment booked for ${existingChild.name} on ${appointmentDate}. Only one appointment per day is allowed.`,
          );
      }

      // Get all booked slots and blocked slots for this doctor on this date
      const existingAppointments = await Appointment.find({
        doctorId,
        appointmentDate: {
          $gte: normalizedDate,
          $lt: nextDay,
        },
        status: { $in: ["pending", "approved"] },
      });

      const bookedSlots = existingAppointments.map(
        (app) => app.appointmentTime,
      );
      const existingBlockedSlots = existingAppointments.reduce((acc, app) => {
        return acc.concat(app.blockedSlots || []);
      }, []);

      // Validate the slot booking using the new utility
      const validation = validateSlotBooking(
        time,
        consultationType,
        bookedSlots,
        existingBlockedSlots,
      );
      if (!validation.valid) {
        return res.status(400).send(validation.error);
      }

      const role = req.user.role;

      // Calculate slot duration and blocked slots
      const slotDuration = consultationType === "New Consultation" ? 30 : 60;
      const blockedSlots =
        consultationType !== "New Consultation"
          ? getBlockedSlotsByAssessment(time).filter((slot) => slot !== time)
          : [];

      const appointment = new Appointment({
        childId: child._id,
        doctorId,
        appointmentDate,
        appointmentTime: time,
        slotDuration,
        blockedSlots,
        branch,
        centreId,
        consultationType,
        childConcerns,
        referredBy,
        pdf: req.file ? req.file.path : "",
        status: "pending",
      });

      await appointment.save();

      // Block slots in configuration for this appointment
      await blockSlotsForAppointment(
        doctorId,
        appointmentDate,
        time,
        consultationType,
        centreId,
      );

      if (role === "admin") {
        if (!child.appointments.includes(appointment._id)) {
          child.appointments.push(appointment._id);
          await child.save();
        }
      }

      // Send SMS notification

      await sendAppointmentAcknowledge({
        mobilenumber: parent.mobilenumber,
        parentName: parent.name,
        appointmentDate,
        time,
      });
      res.status(201).send({
        message: "Appointment booked successfully",
        appointment,
      });
    } catch (err) {
      logger.error(err);
      res.status(500).send("Internal server error");
    }
  },
);

router.put("/updateAppointment/:appointmentId", auth, async (req, res) => {
  const { appointmentDate, appointmentTime } = req.body;

  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Not authorized" });
    }

    const appointment = await Appointment.findById(req.params.appointmentId)
      .populate("childId", "name")
      .populate("doctorId", "name email")
      .populate("centreId", "name admins");

    if (!appointment) {
      return res.status(404).json({ msg: "Appointment not found" });
    }

    if (!appointmentDate && !appointmentTime) {
      return res
        .status(400)
        .json({ msg: "Please provide either date or time to update" });
    }

    const updateFields = {};

    if (appointmentDate) {
      const newDate = new Date(appointmentDate);
      if (isNaN(newDate.getTime())) {
        return res.status(400).json({ msg: "Invalid date format" });
      }
      updateFields.appointmentDate = newDate;
    }

    if (appointmentTime) {
      if (
        !Appointment.schema
          .path("appointmentTime")
          .enumValues.includes(appointmentTime)
      ) {
        return res.status(400).json({ msg: "Invalid time slot" });
      }
      updateFields.appointmentTime = appointmentTime;
    }

    const targetDate = appointmentDate
      ? new Date(appointmentDate)
      : appointment.appointmentDate;
    const targetTime = appointmentTime || appointment.appointmentTime;

    const conflictingAppointment = await Appointment.findOne({
      doctorId: appointment.doctorId,
      appointmentDate: targetDate,
      appointmentTime: targetTime,
      _id: { $ne: req.params.appointmentId },
    });

    if (conflictingAppointment) {
      return res.status(400).json({ msg: "This time slot is already booked" });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.appointmentId,
      updateFields,
      { new: true },
    )
      .populate("childId", "name")
      .populate("doctorId", "name email")
      .populate("centreId", "name");

    res.status(200).json({
      message: "Appointment rescheduled successfully",
      appointment: updatedAppointment,
    });
  } catch (err) {
    logger.error(err);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Invalid appointment ID" });
    }
    res.status(500).json({ msg: "Internal server error" });
  }
});

router.put("/manageAppointment/:appointmentId", auth, async (req, res) => {
  const { appointmentId } = req.params;
  const { status } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res
      .status(400)
      .send("Invalid status. Allowed values are 'approved' or 'rejected'");
  }

  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).send("Appointment not found");
    if (req.user.role !== "superadmin") {
      return res.status(403).send("Unauthorized to manage this appointment");
    }

    appointment.status = status;
    await appointment.save();

    const child = await Child.findById(appointment.childId);
    if (!child) return res.status(404).send("Child not found");

    const parent = await Parent.findById(child.parentId);
    if (!parent) return res.status(404).send("Parent not found");

    const doctor = await Doctor.findById(appointment.doctorId);
    if (!doctor) return res.status(404).send("Doctor not found");

    const centre = await Centre.findById(appointment.centreId);
    if (!centre) return res.status(404).send("Centre not found");

    const time = appointment.appointmentTime;

    if (status === "approved") {
      if (!child.appointments.includes(appointment._id)) {
        child.appointments.push(appointment._id);
        await child.save();
      }

      try {
        await sendAppointmentSMS({
          mobilenumber: parent.mobilenumber,
          parentName: parent.name,
          doctorName: doctor.name,
          appointmentDate: appointment.appointmentDate,
          appointmentTime: time,
          consultationType: appointment.consultationType,
        });
      } catch (error) {
        logger.error("Error sending appointment SMS:", error);
      }
    } else {
      // Appointment rejected - reopen the slot by removing it from slot configuration
      try {
        const SlotConfiguration = require("../models/SlotConfiguration");
        const normalizedDate = new Date(appointment.appointmentDate);
        normalizedDate.setHours(0, 0, 0, 0);

        const slotConfig = await SlotConfiguration.findOne({
          doctorId: appointment.doctorId,
          centreId: appointment.centreId,
          date: normalizedDate,
        });

        if (slotConfig) {
          // Remove the appointment slot from configuration if it's not in default slots
          const DEFAULT_TIME_SLOTS =
            require("../utils/slotUtils").DEFAULT_TIME_SLOTS;

          if (!DEFAULT_TIME_SLOTS.includes(appointment.appointmentTime)) {
            // Remove the custom slot completely
            slotConfig.availableSlots = slotConfig.availableSlots.filter(
              (slot) => slot.time !== appointment.appointmentTime,
            );
          } else {
            // For default slots, just ensure they're unblocked
            const slot = slotConfig.availableSlots.find(
              (s) => s.time === appointment.appointmentTime,
            );
            if (slot) {
              slot.isBlocked = false;
              slot.blockReason = "";
            }
          }

          await slotConfig.save();
        }
      } catch (error) {
        logger.error("Error reopening slot after rejection:", error);
      }
    }

    res.status(200).send({
      message: `Appointment ${status} successfully`,
      appointment,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).send("Internal server error");
  }
});

router.get("/getAppointments/:centreId", auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      centreId: req.params.centreId,
    })
      .populate({
        path: "childId",
        select: "name parentId",
        populate: {
          path: "parentId",
          select: "name phone",
          model: "User",
        },
      })
      .populate("doctorId", "name")
      .populate("centreId", "name")
      .lean();

    // Ensure consistent structure
    const formatted = appointments.map((app) => ({
      _id: app._id,
      consultationType: app.consultationType || "general",
      appointmentDate: app.appointmentDate,
      appointmentTime: app.appointmentTime || "10:00 AM",
      status: app.status || "pending",
      childId: app.childId || { name: "Unknown", parentId: null },
      doctorId: app.doctorId || { name: "N/A" },
      centreId: app.centreId || { name: "N/A" },
      prescription: app.prescription || "",
      previousMedicalReports: app.previousMedicalReports || [],
    }));

    res.status(200).json(formatted);
  } catch (err) {
    logger.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/getPendingAppointments/:centreId", auth, async (req, res) => {
  const { centreId } = req.params;

  try {
    const centre = await Centre.findById(centreId);
    if (!centre) return res.status(404).send("Centre not found");

    const appointments = await Appointment.find({
      centreId: centreId,
      status: "pending",
    })
      .populate({ path: "childId", populate: { path: "parentId" } })
      .populate("doctorId");

    res.status(200).send(appointments);
  } catch (err) {
    logger.error(err);
    res.status(500).send("Internal server error");
  }
});

router.get(
  "/getBookedSlots/:doctorId/:appointmentDate",
  auth,
  async (req, res) => {
    const { doctorId, appointmentDate } = req.params;

    try {
      const inputDate = new Date(appointmentDate);
      // Extract date components to avoid timezone issues
      const year = inputDate.getUTCFullYear();
      const month = inputDate.getUTCMonth();
      const day = inputDate.getUTCDate();
      const normalizedDate = new Date(year, month, day);

      const nextDay = new Date(normalizedDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const appointments = await Appointment.find({
        doctorId: doctorId,
        appointmentDate: {
          $gte: normalizedDate,
          $lt: nextDay,
        },
        status: { $in: ["pending", "approved"] },
      });

      const bookedSlots = appointments.map((app) => app.appointmentTime);

      // Collect all blocked slots from all appointments
      const allBlockedSlots = appointments.reduce((acc, app) => {
        return acc.concat(app.blockedSlots || []);
      }, []);

      // Remove duplicates and combine all unavailable slots
      const unavailableSlots = [
        ...new Set([...bookedSlots, ...allBlockedSlots]),
      ];

      res.status(200).json({
        bookedSlots,
        blockedSlots: allBlockedSlots,
        unavailableSlots,
      });
    } catch (err) {
      logger.error(err);
      res.status(500).send("Internal server error");
    }
  },
);

router.get("/iep/:childId", auth, async (req, res) => {
  const { childId } = req.params;

  try {
    const iep = await IEP.find({ childId })
      .sort({ createdAt: -1 })
      .populate("doctorId", "name")
      .populate("childId", "name dob gender");
    if (!iep) return res.status(404).send("IEP not found");
    res.status(200).send(iep);
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

router.post(
  "/uploadPrescription",
  upload.single("prescription"),
  async (req, res) => {
    const { appointmentId } = req.body;

    try {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) return res.status(404).send("Appointment not found");

      if (!req.file) return res.status(400).send("No file uploaded");

      appointment.prescription = req.file.path;
      await appointment.save();

      res.status(200).send({
        message: "Prescription uploaded successfully",
        appointment,
      });
    } catch (err) {
      logger.error(err);
      res.status(500).send("Internal server error");
    }
  },
);

router.get("/get-prescription/:appointmentId", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId);

    if (!appointment?.prescription) {
      return res.status(404).send("Prescription not found");
    }

    // Convert to absolute path
    const absolutePath = path.resolve(appointment.prescription);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).send("File not found");
    }

    res.sendFile(absolutePath); // Now using absolute path
  } catch (err) {
    logger.error("Error:", err);
    res.status(500).send("Server error");
  }
});

router.get("/get-jwl-enquiries/:centre", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Access Denied");

  try {
    const centerName = await Centre.findById(req.params.centre, {
      _id: 0,
      name: 1,
    });
    const enquiries = await jwlUser
      .find(
        { preferredCenter: centerName.name },
        {
          _id: 0,
          referenceId: 1,
          parentName: 1,
          parentEmail: 1,
          parentPhoneNo: 1,
          isArchived: 1,
          childName: 1,
          enquiryDate: 1,
        },
      )
      .sort({ enquiryDate: 1 });
    res.status(200).send(enquiries);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/get-jwl-enquiry/:referenceId", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Access Denied");
  try {
    const enquiry = await jwlUser.findOne({
      referenceId: req.params.referenceId,
    });
    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }
    res.json(enquiry);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/get-jwluser-video/:parentEmail", auth, async (req, res) => {
  if (req.user.role === "therapist" || req.user.role === "parent")
    return res.status(403).send("Access Denied");

  try {
    const parentEmail = req.params.parentEmail;
    const sanitizedEmail = parentEmail.split("@")[0];
    const filepath = `/home/totaluploads/jwluploads/${sanitizedEmail}.mp4`;
    if (!fs.existsSync(filepath)) {
      return res.send("No video found");
    }
    res.sendFile(filepath);
  } catch (err) {
    logger.log(err);
    res.status(500).send("Error retrieving video");
  }
});

router.put("/archive-jwl-enquiry", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Access Denied");
  try {
    const parentEmail = req.body.parentEmail;
    await jwlUser.findOneAndUpdate(
      { parentEmail: parentEmail },
      { isArchived: true },
      { new: true },
    );
    res.status(200).send("Enquiry archived successfully");
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/allParents/:centreId", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Unauthorized" });

    const parents = await Parent.find({ centreId: req.params.centreId })
      .select("name mobilenumber address referenceId createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json(parents);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: "Failed to fetch parents" });
  }
});

// Get available slots for a specific consultation type
router.get(
  "/getAvailableSlots/:centreId/:doctorId/:appointmentDate/:consultationType",
  auth,
  async (req, res) => {
    const { centreId, doctorId, appointmentDate, consultationType } =
      req.params;

    try {
      // Parse date properly to avoid timezone issues
      const inputDate = new Date(appointmentDate);
      logger.info("Input Date:", inputDate);
      // Check for holiday first
      const holiday = await Holiday.findOne({ date: inputDate });
      if (holiday) {
        return res.status(200).json({
          availableSlots: [],
          consultationType,
          totalSlots: 0,
          isHoliday: true,
          holidayName: holiday.name,
          message: `Holiday: ${holiday.name} - No appointments available`,
        });
      }

      // Get slot configuration for this doctor at this center on this date
      let slotConfig = await SlotConfiguration.findOne({
        doctorId,
        centreId,
        date: inputDate,
      });

      // If no configuration exists, use default slots
      if (!slotConfig) {
        slotConfig = {
          availableSlots: DEFAULT_TIME_SLOTS.map((time) => ({
            time,
            isActive: true,
            isBlocked: false,
            blockReason: "",
          })),
          isOperational: true,
        };
      }

      // Check if the doctor is operational on this date
      if (!slotConfig.isOperational) {
        return res.status(200).json({
          availableSlots: [],
          consultationType,
          totalSlots: 0,
          message: "Doctor is not operational on this date",
        });
      }

      // Get all available (active and not blocked) slots from configuration
      const configuredSlots = slotConfig.availableSlots
        .filter((slot) => slot.isActive && !slot.isBlocked)
        .map((slot) => slot.time);

      // Fetch existing appointments to exclude booked slots
      const nextDay = new Date(inputDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const existingAppointments = await Appointment.find({
        doctorId,
        centreId,
        appointmentDate: {
          $gte: inputDate,
          $lt: nextDay,
        },
        status: { $in: ["pending", "approved"] },
      });

      // Get all booked slots and blocked slots from appointments
      const bookedSlots = existingAppointments.map(
        (app) => app.appointmentTime,
      );
      const allBlockedSlots = existingAppointments.reduce((acc, app) => {
        return acc.concat(app.blockedSlots || []);
      }, []);

      // Combine all unavailable slots
      const unavailableSlots = new Set([...bookedSlots, ...allBlockedSlots]);

      // Filter out unavailable slots from configured slots
      const availableSlots = configuredSlots.filter(
        (slot) => !unavailableSlots.has(slot),
      );

      // For assessment appointments, filter to get only 1-hour slot options
      const finalSlots =
        consultationType !== "New Consultation"
          ? getAssessmentSlotsFromList(
              availableSlots,
              bookedSlots,
              allBlockedSlots,
            )
          : availableSlots;

      res.status(200).json({
        availableSlots: finalSlots,
        consultationType,
        totalSlots: finalSlots.length,
      });
    } catch (err) {
      logger.error(err);
      res.status(500).send("Internal server error");
    }
  },
);

module.exports = router;
