const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const mongoose = require("mongoose");
const User = require("../models/User").User;
const Admin = require("../models/User").Admin;
const Therapist = require("../models/User").Therapist;
const Doctor = require("../models/User").Doctor;
const Child = require("../models/Child");
const SuperAdmin = require("../models/User").SuperAdmin;
const IEP = require("../models/IEP");
const Appointment = require("../models/Appointment");
const SlotConfiguration = require("../models/SlotConfiguration");
const { createOrUpdateSlotConfiguration, blockSlot, unblockSlot, ensureSlotInConfiguration, DEFAULT_TIME_SLOTS, timeToMinutes } = require("../utils/slotUtils");
const Centre = require("../models/Centre");
const Game = require("../models/Game");
const Counter = require('../models/Counter');
const bcrypt = require('bcryptjs');
const { verify } = require("jsonwebtoken");
const Holiday = require('../models/Calendar');
const Announcement = require("../models/Announcement");
const { logger } = require("../utils/logger");


// Middleware to verify superadmin role
const verifySuperAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied. Superadmin only." });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

router.post('/therapists/:therapistId/feedback',auth, async (req, res) => {
  if (req.user.role !== "superadmin" ) {
    return res.status(403).json({ message: "Unauthorized: Only admins can provide feedback" });
  }
  
        const { therapistId } = req.params;
        const { content } = req.body;
        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Feedback content is required" });
        }  
        try {
            const therapist = await Therapist.findById(therapistId);
            if (!therapist) {
              return res.status(404).json({ message: "Therapist not found" });
            }
            // 2. Create the new feedback entry using the secure writerId
            const newFeedback = {
                content: content,
                date: new Date()
            };
            // 3. Save the document
            therapist.feedback.push(newFeedback);
            await therapist.save();
            res.status(200).json({ message: "Feedback saved successfully." });
        } catch (error) {
            // ... (Error handling)
              logger.error("Error saving feedback:", error);
            res.status(500).json({ message: "Server error while saving feedback.", error: error.message });
        }
    });


// Get announcements - accessible by both authenticated and non-authenticated users
router.get("/announcements", async (req, res) => {
  try {
    // Get all announcements, sorted by creation date (newest first)
    const announcements = await Announcement.find({})
      .sort({ createdAt: -1 })
      .populate("createdBy", "name role")
      .lean();

    res.json(announcements);
  } catch (error) {
    logger.error("Error fetching announcements:", error);
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
});

// Create new announcement (SuperAdmin only)
router.post("/announcements", auth, verifySuperAdmin, async (req, res) => {
  try {
    const { message, displayInScroller, link, targetType, targetRoles } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const announcement = new Announcement({
      message: message.trim(),
      displayInScroller: displayInScroller || false,
      targetType: targetType || "all",
      targetRoles: targetRoles || [],
      createdBy: req.user._id,
      link: link || null,
    });

    await announcement.save();
    await announcement.populate("createdBy", "name role");

    res.status(201).json({
      message: "Announcement created successfully",
      announcement
    });
  } catch (error) {
    logger.error("Error creating announcement:", error);
    res.status(500).json({ error: "Failed to create announcement" });
  }
});

// Update announcement (SuperAdmin only)
router.put("/announcements/:id", auth, verifySuperAdmin, async (req, res) => {
  try {
    const { message, displayInScroller, targetType, link, targetRoles } = req.body;
    
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      {
        message: message.trim(),
        displayInScroller,
        targetType,
        targetRoles,
        link: link || null,
      },
      { new: true }
    ).populate("createdBy", "name role");

    if (!announcement) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    res.json({
      message: "Announcement updated successfully",
      announcement
    });
  } catch (error) {
    logger.error("Error updating announcement:", error);
    res.status(500).json({ error: "Failed to update announcement" });
  }
});

// Delete announcement (SuperAdmin only)
router.delete("/announcements/:id", auth, verifySuperAdmin, async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    res.json({ message: "Announcement deleted successfully" });
  } catch (error) {
    logger.error("Error deleting announcement:", error);
    res.status(500).json({ error: "Failed to delete announcement" });
  }
});

// Get analytics data
router.get("/analytics", auth, verifySuperAdmin, async (req, res) => {
  try {
    // Basic counts
    const [totalUsers, totalChildren, totalIEPs, totalAppointments, totalCentres] = 
    await Promise.all([
      User.countDocuments(),
      Child.countDocuments(),
      IEP.countDocuments(),
      Appointment.countDocuments(),
      Centre.countDocuments()
    ]);

    // User distribution by role
    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);

    // Appointment status distribution
    const appointmentsByStatus = await Appointment.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // Recent appointments
    const recentAppointments = await Appointment.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("childId", "name")
      .populate("doctorId", "name");

    // Centre-wise distribution
    const centreDistribution = await Centre.aggregate([
      {
        $lookup: {
          from: "children",
          localField: "_id",
          foreignField: "centreId",
          as: "children"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "centreId",
          as: "staff"
        }
      },
      {
        $project: {
          name: 1,
          childCount: { $size: "$children" },
          staffCount: { $size: "$staff" }
        }
      }
    ]);

    // Game performance stats
    const gameStats = await Game.aggregate([
      {
        $group: {
          _id: "$gameName",
          totalPlays: { $sum: 1 },
          avgScore: { $avg: "$score" }
        }
      }
    ]);
    
    res.json({
      totalUsers,
      totalChildren,
      totalIEPs,
      totalAppointments,
      totalCentres,
      usersByRole,
      appointmentsByStatus,
      recentAppointments,
      centreDistribution,
      gameStats
    });
  } catch (error) {
    logger.error("Analytics error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all users data with populated centre info
router.get("/users", auth, verifySuperAdmin, async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password")
      .populate("centreId", "name");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all children data with populated relationships
router.get("/children", auth, verifySuperAdmin, async (req, res) => {
  try {
    const children = await Child.find({})
      .populate("parentId", "name email phone -_id")
      .populate("centreId", "name")
      .populate({
        path: "IEPs",
        select: "therapy startingMonth startingYear",
      });
    res.json(children);
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Server error" });
  }
});

// Get detailed data for a specific child
router.get("/children/:childId", auth, verifySuperAdmin, async (req, res) => {
  try {
    const child = await Child.findById(req.params.childId)
      .populate("parentId", "name email mobilenumber")
      .populate("doctorId", "name email role")
      .populate("centreId", "name")
      .populate({
        path: "therapies.therapistId",
        select: "name email role",
      })
      .populate({
        path: "IEPs",
        select: "therapy startingMonth startingYear",
      })
      .populate({
        path: "appointments",
        select: "appointmentDate appointmentTime status",
      });
    
    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }
    
    res.json(child);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get IEPs for a specific child
router.get("/children/:childId/ieps", auth, verifySuperAdmin, async (req, res) => {
  try {
    const ieps = await IEP.find({ childId: req.params.childId })
      .populate("doctorId", "name")
      .populate({
        path: "childId",
        populate: {
          path: "centreId",
          select: "name address city"
        }
      })
      // .populate("therapistId", "name")
      .sort({ startingYear: -1, startingMonth: -1 });
    
    res.json(ieps);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get appointments for a specific child
router.get("/children/:childId/appointments", auth, verifySuperAdmin, async (req, res) => {
  try {
    const appointments = await Appointment.find({ childId: req.params.childId })
      .populate("doctorId", "name")
      .sort({ datetime: -1 });
    
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all IEPs data with populated relationships
router.get("/ieps", auth, verifySuperAdmin, async (req, res) => {
  try {
    const ieps = await IEP.find({})
      .populate("childId", "name age gender")
      .populate("doctorId", "name");
    res.json(ieps);
  } catch (error) {
    logger.error("Error fetching IEPs:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all appointments data with populated relationships
router.get("/appointments", auth, verifySuperAdmin, async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .populate("childId", "name")
      .populate("doctorId", "name")
      .populate("centreId", "name");
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all centres data with staff and children counts
router.get("/centres", auth, verifySuperAdmin, async (req, res) => {
  try {
    const centres = await Centre.find({});
    
    // Process the counts directly from the arrays in Centre model
    const centresWithCounts = centres.map(centre => {
      const centreObj = centre.toObject();
      return {
        ...centreObj,
        doctorCount: centreObj.doctors ? centreObj.doctors.length : 0,
        therapistCount: centreObj.therapists ? centreObj.therapists.length : 0,
        adminCount: centreObj.admins ? centreObj.admins.length : 0,
        childrenCount: centreObj.children ? centreObj.children.length : 0
      };
    });
    
    res.json(centresWithCounts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Add a new centre
router.post('/addCentre', auth, verifySuperAdmin, async (req, res) => {
    try {
        const { name, address, city, state, pincode, contactNumber } = req.body;
        const counter = await Counter.findOneAndUpdate(
            { field: "centreNumber" },
            { $inc: { value: 1 } },
            { new: true, upsert: true }
        );
        const newCentre = new Centre({
            centreNumber: counter.value,
            name,
            address,
            city,
            state,
            pincode,
            contactNumber
        });

        await newCentre.save();
        res.status(201).json({ success: true, message: "Centre added successfully.", centre: newCentre });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
});

// Add a new admin to a centre
router.post("/addAdmin", async (req, res) => {
    try {
        const { centreId, ...userData } = req.body;
        const centre = await Centre.findById(centreId);
        if (!centre) return res.status(404).send("Centre not found");

        const user = new Admin(userData);
        user.password = await bcrypt.hash(user.password, 8);
        user.centreId = centreId;
        user.role = "admin";
        await user.save();
        if (!centre.admins.includes(user._id)) {
            centre.admins.push(user._id);
        }
        await centre.save();
        res.status(201).send({ message: `Admin registered successfully`, user, centre });
    }
    catch(e){
        res.status(500).json({ success: false, message: "Server error", error: e.message });
    }
});

// Get system health status
router.get("/system-health", auth, verifySuperAdmin, async (req, res) => {
  try {
    // Database connection status
    const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    // API endpoints status
    const endpoints = [
      { path: "/api/users", status: "active" },
      { path: "/api/children", status: "active" },
      { path: "/api/ieps", status: "active" },
      { path: "/api/appointments", status: "active" },
      { path: "/api/centres", status: "active" }
    ];

    // System metrics
    const metrics = {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };

    // Recent errors (if you have error logging)
    const recentErrors = [];  // Implement error logging if needed

    // System load
    const activeConnections = mongoose.connections.length;
    
    res.json({
      status: "operational",
      dbStatus,
      endpoints,
      metrics,
      recentErrors,
      activeConnections
    });
  } catch (error) {
    logger.error("System health check error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get detailed IEP statistics
router.get("/iep-stats", auth, verifySuperAdmin, async (req, res) => {
  try {
    const stats = await IEP.aggregate([
      {
        $group: {
          _id: "$therapy",
          count: { $sum: 1 },
          avgGoalsPerMonth: {
            $avg: { $size: "$monthlyGoals" }
          }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get appointment trends
router.get("/appointment-trends", auth, verifySuperAdmin, async (req, res) => {
  try {
    const monthlyTrends = await Appointment.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$datetime" },
            month: { $month: "$datetime" }
          },
          count: { $sum: 1 },
          completedCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0]
            }
          }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 }
    ]);

    res.json(monthlyTrends);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Add a new superadmin
router.post("/add-superadmin", auth, verifySuperAdmin, async (req, res) => {
  try {
    const { password, name, email, mobilenumber } = req.body;

    // Validate input
    if (!password || !name || !email || !mobilenumber) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Check if mobile number already exists
    const existingUser = await User.findOne({ mobilenumber });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Mobile number already registered"
      });
    }

    // Create new superadmin user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newSuperAdmin = new User({
      password: hashedPassword,
      role: "superadmin",
      name,
      email,
      mobilenumber
    });

    await newSuperAdmin.save();

    // Remove password from response
    // const superAdminData = newSuperAdmin.toObject();
    // delete superAdminData.password;

    // // Send welcome email
    // const mailBody = `
    // Dear ${name},

    // You have been registered as a Super Admin at Total Solutions.
    
    // Your login credentials:
    // Mobile Number: ${mobilenumber}
    // Password: ${password}

    // Please change your password after your first login.

    // Access the platform at: ${process.env.WEBSITE_URL}

    // Best regards,
    // Total Solutions Team
    // `;

    // try {
    //   await mailUtility(email, "Super Admin Account Created - Total Solutions", mailBody);
    // } catch (err) {
    //   logger.error("Error sending email:", err);
    //   // Continue even if email fails
    // }

    res.status(201).json({
      success: true,
      message: "Super Admin created successfully",
    //   superAdmin: superAdminData
    });

  } catch (error) {
    logger.error("Error creating superadmin:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});




// ---------------------------------------------
// --- HOLIDAY CALENDAR ROUTES (Superadmin Only) ---
// ---------------------------------------------
// Helper to reliably parse the YYYY-MM-DD string from the frontend into a Date object
const parseHolidayDate = (dateString) => {
    // Adding 'T00:00:00.000Z' ensures the date is treated as the start of the day in UTC
    // which prevents timezone offsets from shifting the date.
    return new Date(`${dateString}T00:00:00.000Z`);
};
// 1. GET /api/superadmin/holidays - Fetch all holidays (Read)
// Protected by auth and verifySuperAdmin (for consistent access control)
router.get("/holidays", auth, async (req, res) => {
    try {
        const holidays = await Holiday.find({
          date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } 
        }).sort('date');
        res.status(200).json({ success: true, data: holidays });
    } catch (error) {
        logger.error("Error fetching holidays:", error);
        res.status(500).json({ success: false, message: "Server error fetching holidays." });
    }
});
// 2. POST /api/superadmin/holidays - Add a new holiday (Create)
// Protected by auth and verifySuperAdmin
router.post("/holidays", auth, verifySuperAdmin, async (req, res) => {
    const { name, date } = req.body; // date will be YYYY-MM-DD string

    if (!name || !date) {
        return res.status(400).json({ success: false, message: "Holiday name and date are required." });
    }
    
    try {
        const parsedDate = parseHolidayDate(date);

        const newHoliday = await Holiday.create({
            name,
            date: parsedDate,
        });

        res.status(201).json({ 
            success: true, 
            message: "Holiday added successfully.", 
            data: newHoliday
        });

    } catch (error) {
        if (error.code === 11000) { // MongoDB duplicate key error (for unique date)
            return res.status(400).json({ success: false, message: "A holiday already exists on this date." });
        }
        logger.error("Error adding holiday:", error);
        res.status(500).json({ success: false, message: "Server error while adding holiday." });
    }
});

// 3. DELETE /api/superadmin/holidays/:id - Delete a holiday (Delete)
// Protected by auth and verifySuperAdmin
router.delete("/holidays/:id", auth, verifySuperAdmin, async (req, res) => {
    try {
        const holiday = await Holiday.findByIdAndDelete(req.params.id);

        if (!holiday) {
            return res.status(404).json({ success: false, message: "Holiday not found." });
        }

        res.status(200).json({ 
            success: true, 
            message: "Holiday deleted successfully."
        });

    } catch (error) {
        logger.error("Error deleting holiday:", error);
        res.status(500).json({ success: false, message: "Server error while deleting holiday." });
    }
});


// ---------------------------------------------

router.post("/announcements", auth,verifySuperAdmin, async (req, res) => {
  // Assuming 'admin' role includes superadmin privileges for this action
  const { message, displayInScroller, targetType, targetRoles } = req.body;
  if (!message || !message.trim()) {
  return res.status(400).send({ error: "Announcement message is required" });
  }
  if (targetType === "specific" && (!targetRoles || !Array.isArray(targetRoles) || targetRoles.length === 0)) {
    return res.status(400).send({ error: "Target roles must be a non-empty array when targetType is 'specific'" });
  }
  try {
    const newAnnouncement = new Announcement({
      message,
      displayInScroller: !!displayInScroller,
      targetType: targetType || "all",
      targetRoles: targetType === "specific" ? targetRoles : [],
      createdBy: req.user._id,
    });

    await newAnnouncement.save();
    res.status(201).send({
      message: "Announcement created successfully",
      data: newAnnouncement,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).send({ error: "Server error during announcement creation", details: err.message });
  }
});

router.get("/announcements", auth, async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.status(200).send({ data: announcements });
  } catch (err) {
    logger.error("Error fetching announcements:", err);
    res.status(500).send({
      error: "Server error fetching announcements",
      details: err.message,
    });
  }
});



router.delete("/announcements/:id", auth,verifySuperAdmin, async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
      return res.status(404).send("Announcement not found");
    }

    res.send({ message: "Announcement deleted successfully" });
  } catch (err) {
    logger.error(err);
    res.status(500).send({ error: "Server error during announcement deletion", details: err.message });
  }
});

// ===== SLOT MANAGEMENT ROUTES =====

// Get slot configurations for a doctor in a center (optionally filtered by date)
router.get("/slot-config/:centreId/:doctorId", auth, async (req, res) => {
  try {
    if (req.user.role !== "superadmin" && req.user.role !== "admin" && req.user.role !== "parent") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { doctorId, centreId } = req.params;
    const { date, limit = 30 } = req.query;
    
    // Build query filter
    const filter = { doctorId, centreId };
    
    if (date) {
      // Parse date correctly to avoid timezone issues
      const targetDate = new Date(date + 'T00:00:00.000Z');
      
      // Check for holiday first
      const holiday = await Holiday.findOne({ date: targetDate });
      if (holiday) {
        return res.status(200).json([{
          doctorId,
          centreId,
          date: targetDate,
          isHoliday: true,
          holidayName: holiday.name,
          availableSlots: [],
          isOperational: false
        }]);
      }
      
      // Use date range query to find any slot config for this specific day
      // regardless of the exact time stored in the database
      const startOfDay = new Date(date + 'T00:00:00.000Z');
      const endOfDay = new Date(date + 'T23:59:59.999Z');
      
      filter.date = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }
    
    const slotConfigs = await SlotConfiguration.find(filter)
      .populate('doctorId', 'name email')
      .sort({ date: 1 })
      .limit(parseInt(limit));

    // If specific date requested but no config exists, return default structure in array format
    if (date && slotConfigs.length === 0) {
      // Use the same date parsing to avoid timezone shifts
      const targetDate = new Date(date + 'T00:00:00.000Z');
      return res.json([{
        doctorId,
        centreId,
        date: targetDate,
        availableSlots: DEFAULT_TIME_SLOTS.map(time => ({
          time,
          isActive: true,
          isBlocked: false,
          blockReason: ''
        })),
        isOperational: true,
        _id: null // Indicate this is a default config, not saved to DB
      }]);
    }

    res.json(slotConfigs);
  } catch (error) {
    logger.error("Error fetching slot configurations:", error);
    res.status(500).json({ error: "Failed to fetch slot configurations" });
  }
});

// Create or update slot configuration
router.post("/slot-config", auth, async (req, res) => {
  try {
    if (req.user.role !== "superadmin" && req.user.role !== "admin" && req.user.role !== "parent") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { doctorId, centreId, date, slots } = req.body;

    if (!doctorId || !centreId || !date || !slots) {
      return res.status(400).json({ error: "Missing required fields: doctorId, centreId, date, slots" });
    }

    // Parse date correctly to avoid timezone issues
    const targetDate = new Date(date + 'T00:00:00.000Z');
    
    // Use date range to find existing configuration for this day
    const startOfDay = new Date(date + 'T00:00:00.000Z');
    const endOfDay = new Date(date + 'T23:59:59.999Z');

    // Find existing or create new slot configuration
    let slotConfig = await SlotConfiguration.findOne({
      doctorId,
      centreId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    if (slotConfig) {
      slotConfig.availableSlots = slots;
      await slotConfig.save();
    } else {
      slotConfig = new SlotConfiguration({
        doctorId,
        centreId,
        date: targetDate,
        availableSlots: slots,
        isOperational: true
      });
      await slotConfig.save();
    }

    res.json({ 
      message: "Slot configuration updated successfully", 
      slotConfig 
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Failed to update slot configuration" });
  }
});

// Block a specific slot (blocks across ALL centers for the doctor)
router.post("/block-slot", auth, async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { doctorId, centreId, date, slotTime, blockReason, blockAllCenters = false } = req.body;
    
    if (!doctorId || !date || !slotTime) {
      return res.status(400).json({ error: "Missing required fields: doctorId, date, slotTime" });
    }
    
    const targetDate = new Date(date + 'T00:00:00.000Z');
    const startOfDay = new Date(date + 'T00:00:00.000Z');
    const endOfDay = new Date(date + 'T23:59:59.999Z');

    let result = {};

    if (blockAllCenters) {
      // Block this slot across ALL centers for this doctor
      const allCentres = await Centre.find({});
      
      for (const centre of allCentres) {
        let slotConfig = await SlotConfiguration.findOne({
          doctorId,
          centreId: centre._id,
          date: { $gte: startOfDay, $lte: endOfDay }
        });

        if (!slotConfig) {
          // Create new slot configuration with default slots
          const allSlots = [...DEFAULT_TIME_SLOTS];
          if (!DEFAULT_TIME_SLOTS.includes(slotTime)) {
            allSlots.push(slotTime);
          }
          
          slotConfig = new SlotConfiguration({
            doctorId,
            centreId: centre._id,
            date: targetDate,
            availableSlots: allSlots.map(time => ({
              time,
              isActive: true,
              isBlocked: time === slotTime,
              blockReason: time === slotTime ? (blockReason || 'Blocked across all centers') : ''
            })),
            isOperational: true
          });
        } else {
          let slot = slotConfig.availableSlots.find(s => s.time === slotTime);
          if (!slot) {
            slotConfig.availableSlots.push({
              time: slotTime,
              isActive: true,
              isBlocked: true,
              blockReason: blockReason || 'Blocked across all centers'
            });
          } else {
            slot.isBlocked = true;
            slot.blockReason = blockReason || 'Blocked across all centers';
          }
        }
        await slotConfig.save();
      }
      result.message = `Slot blocked across all centers for doctor`;
      result.centresAffected = allCentres.length;
    } else {
      // Block only in specific center
      let slotConfig = await SlotConfiguration.findOne({
        doctorId,
        centreId,
        date: { $gte: startOfDay, $lte: endOfDay }
      });

      if (!slotConfig) {
        // Create new slot configuration with default slots
        const allSlots = [...DEFAULT_TIME_SLOTS];
        if (!DEFAULT_TIME_SLOTS.includes(slotTime)) {
          allSlots.push(slotTime);
        }
        
        slotConfig = new SlotConfiguration({
          doctorId,
          centreId,
          date: targetDate,
          availableSlots: allSlots.map(time => ({
            time,
            isActive: true,
            isBlocked: time === slotTime,
            blockReason: time === slotTime ? (blockReason || 'Blocked by superadmin') : ''
          })),
          isOperational: true
        });
      } else {
        let slot = slotConfig.availableSlots.find(s => s.time === slotTime);
        if (!slot) {
          // Add the slot if it doesn't exist
          slotConfig.availableSlots.push({
            time: slotTime,
            isActive: false,
            isBlocked: true,
            blockReason: blockReason || 'Blocked by superadmin'
          });
        } else {
          slot.isBlocked = true;
          slot.blockReason = blockReason || 'Blocked by superadmin';
        }
      }
      await slotConfig.save();
      result.message = `Slot blocked in specific center only`;
    }

    res.json(result);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Failed to block slot" });
  }
});

// Block all slots for a doctor in a specific center for a day
router.post("/block-all-slots", auth, async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { doctorId, centreId, date, blockReason } = req.body;
    
    if (!doctorId || !centreId || !date) {
      return res.status(400).json({ error: "Missing required fields: doctorId, centreId, date" });
    }

    const targetDate = new Date(date + 'T00:00:00.000Z');
    const startOfDay = new Date(date + 'T00:00:00.000Z');
    const endOfDay = new Date(date + 'T23:59:59.999Z');

    // Find or create slot configuration
    let slotConfig = await SlotConfiguration.findOne({
      doctorId,
      centreId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (!slotConfig) {
      // Create new configuration with all slots blocked
      slotConfig = new SlotConfiguration({
        doctorId,
        centreId,
        date: targetDate,
        availableSlots: DEFAULT_TIME_SLOTS.map(time => ({
          time,
          isActive: true,
          isBlocked: true,
          blockReason: blockReason || 'All slots blocked for the day'
        })),
        isOperational: false
      });
    } else {
      // Block all existing slots
      slotConfig.availableSlots.forEach(slot => {
        slot.isBlocked = true;
        slot.blockReason = blockReason || 'All slots blocked for the day';
      });
      slotConfig.isOperational = false;
    }

    await slotConfig.save();
    res.json({ 
      message: `All slots blocked for doctor in center ${centreId} on ${date}`,
      slotsBlocked: slotConfig.availableSlots.length
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Failed to block all slots" });
  }
});

// Bulk block all slots for a doctor across multiple centers for a day
router.post("/bulk-block-slots", auth, async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { doctorId, centreIds, date, blockReason } = req.body;
    
    if (!doctorId || !centreIds || !Array.isArray(centreIds) || centreIds.length === 0 || !date) {
      return res.status(400).json({ error: "Missing required fields: doctorId, centreIds (array), date" });
    }

    const targetDate = new Date(date + 'T00:00:00.000Z');
    const startOfDay = new Date(date + 'T00:00:00.000Z');
    const endOfDay = new Date(date + 'T23:59:59.999Z');

    let totalSlotsBlocked = 0;
    const results = [];

    // Process each center
    for (const centreId of centreIds) {
      try {
        // Find or create slot configuration for this center
        let slotConfig = await SlotConfiguration.findOne({
          doctorId,
          centreId,
          date: { $gte: startOfDay, $lte: endOfDay }
        });

        if (!slotConfig) {
          // Create new configuration with all slots blocked
          slotConfig = new SlotConfiguration({
            doctorId,
            centreId,
            date: targetDate,
            availableSlots: DEFAULT_TIME_SLOTS.map(time => ({
              time,
              isActive: true,
              isBlocked: true,
              blockReason: blockReason || 'Bulk block operation'
            })),
            isOperational: false
          });
        } else {
          // Block all existing slots
          slotConfig.availableSlots.forEach(slot => {
            slot.isBlocked = true;
            slot.blockReason = blockReason || 'Bulk block operation';
          });
          slotConfig.isOperational = false;
        }

        await slotConfig.save();
        totalSlotsBlocked += slotConfig.availableSlots.length;
        
        // Get center name for response
        const centre = await Centre.findById(centreId).select('name');
        results.push({
          centreId,
          centreName: centre ? centre.name : 'Unknown',
          slotsBlocked: slotConfig.availableSlots.length
        });
      } catch (centerError) {
        logger.error(`Error blocking slots for center ${centreId}:`, centerError);
        results.push({
          centreId,
          centreName: 'Error',
          slotsBlocked: 0,
          error: centerError.message
        });
      }
    }

    res.json({ 
      message: `Bulk block operation completed for ${centreIds.length} centers on ${date}`,
      totalSlotsBlocked,
      results
    });
  } catch (error) {
    logger.error("Error in bulk block operation:", error);
    res.status(500).json({ error: "Failed to bulk block slots" });
  }
});

// Get doctors list for a specific center
router.get("/center-doctors/:centreId", auth, async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { centreId } = req.params;
    
    // Find center and populate doctors
    const center = await Centre.findById(centreId).populate('doctors', 'name email mobilenumber');
    
    if (!center) {
      return res.status(404).json({ error: "Center not found" });
    }

    res.json({
      centerName: center.name,
      doctors: center.doctors || []
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Failed to fetch center doctors" });
  }
});

// Unblock a specific slot in a specific center
router.post("/unblock-slot", auth, async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { doctorId, centreId, date, slotTime } = req.body;
    
    if (!doctorId || !centreId || !date || !slotTime) {
      return res.status(400).json({ error: "Missing required fields: doctorId, centreId, date, slotTime" });
    }
    
    const targetDate = new Date(date + 'T00:00:00.000Z');
    const startOfDay = new Date(date + 'T00:00:00.000Z');
    const endOfDay = new Date(date + 'T23:59:59.999Z');

    // Find slot configuration for specific center
    let slotConfig = await SlotConfiguration.findOne({
      doctorId,
      centreId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (!slotConfig) {
      return res.status(404).json({ error: "Slot configuration not found for this center" });
    }

    let slot = slotConfig.availableSlots.find(s => s.time === slotTime);
    if (!slot) {
      return res.status(404).json({ error: "Slot not found in this center's configuration" });
    }

    // Unblock the slot
    slot.isBlocked = false;
    slot.blockReason = '';
    
    await slotConfig.save();
    
    res.json({ 
      message: `Slot ${slotTime} unblocked successfully in center ${centreId}`,
      slotTime,
      centreId,
      doctorId 
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Failed to unblock slot" });
  }
});

// Bulk unblock all slots for a doctor across multiple centers for a day
router.post("/bulk-unblock-slots", auth, async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { doctorId, centreIds, date } = req.body;
    
    if (!doctorId || !centreIds || !Array.isArray(centreIds) || centreIds.length === 0 || !date) {
      return res.status(400).json({ error: "Missing required fields: doctorId, centreIds (array), date" });
    }

    const targetDate = new Date(date + 'T00:00:00.000Z');
    const startOfDay = new Date(date + 'T00:00:00.000Z');
    const endOfDay = new Date(date + 'T23:59:59.999Z');

    let totalSlotsUnblocked = 0;
    const results = [];

    // Process each center
    for (const centreId of centreIds) {
      try {
        // Find slot configuration for this center
        let slotConfig = await SlotConfiguration.findOne({
          doctorId,
          centreId,
          date: { $gte: startOfDay, $lte: endOfDay }
        });

        if (!slotConfig) {
          // Get center name for response
          const centre = await Centre.findById(centreId).select('name');
          results.push({
            centreId,
            centreName: centre ? centre.name : 'Unknown',
            slotsUnblocked: 0,
            message: 'No slot configuration found'
          });
          continue;
        }

        // Count currently blocked slots
        let unblockedCount = 0;
        
        // Unblock all slots
        slotConfig.availableSlots.forEach(slot => {
          if (slot.isBlocked) {
            slot.isBlocked = false;
            slot.blockReason = '';
            unblockedCount++;
          }
        });
        
        // Set operational status back to true
        slotConfig.isOperational = true;
        slotConfig.operationalReason = '';

        await slotConfig.save();
        totalSlotsUnblocked += unblockedCount;
        
        // Get center name for response
        const centre = await Centre.findById(centreId).select('name');
        results.push({
          centreId,
          centreName: centre ? centre.name : 'Unknown',
          slotsUnblocked: unblockedCount,
          message: unblockedCount > 0 ? 'Slots unblocked successfully' : 'No blocked slots found'
        });
      } catch (centerError) {
        logger.error(`Error unblocking slots for center ${centreId}:`, centerError);
        results.push({
          centreId,
          centreName: 'Error',
          slotsUnblocked: 0,
          error: centerError.message
        });
      }
    }

    res.json({ 
      message: `Bulk unblock operation completed for ${centreIds.length} centers on ${date}`,
      totalSlotsUnblocked,
      results
    });
  } catch (error) {
    logger.error("Error in bulk unblock operation:", error);
    res.status(500).json({ error: "Failed to bulk unblock slots" });
  }
});

router.get("/doctor-centers-status/:doctorId/:date", auth, async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { doctorId, date } = req.params;
    
    if (!doctorId || !date) {
      return res.status(400).json({ error: "Missing required fields: doctorId, date" });
    }

    const targetDate = new Date(date + 'T00:00:00.000Z');
    const startOfDay = new Date(date + 'T00:00:00.000Z');
    const endOfDay = new Date(date + 'T23:59:59.999Z');

    // Get doctor and their centers
    const doctor = await User.findById(doctorId).populate('centreIds', 'name');
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const centerStatuses = [];
    
    // Check status for each center
    for (const centre of doctor.centreIds) {
      try {
        const slotConfig = await SlotConfiguration.findOne({
          doctorId,
          centreId: centre._id,
          date: { $gte: startOfDay, $lte: endOfDay }
        });

        let status = 'available'; // default status
        let blockedSlotsCount = 0;
        let totalSlotsCount = DEFAULT_TIME_SLOTS.length;
        let isOperational = true;

        if (slotConfig) {
          isOperational = slotConfig.isOperational !== false;
          totalSlotsCount = slotConfig.availableSlots.length;
          blockedSlotsCount = slotConfig.availableSlots.filter(slot => slot.isBlocked).length;
          
          if (!isOperational || blockedSlotsCount === totalSlotsCount) {
            status = 'fully_blocked';
          } else if (blockedSlotsCount > 0) {
            status = 'partially_blocked';
          }
        }

        centerStatuses.push({
          centreId: centre._id,
          centreName: centre.name,
          status,
          isOperational,
          blockedSlotsCount,
          totalSlotsCount,
          operationalReason: slotConfig?.operationalReason || ''
        });
      } catch (centerError) {
        logger.error(`Error checking status for center ${centre._id}:`, centerError);
        centerStatuses.push({
          centreId: centre._id,
          centreName: centre.name,
          status: 'error',
          error: centerError.message
        });
      }
    }

    // Categorize centers
    const blockedCenters = centerStatuses.filter(c => c.status === 'fully_blocked');
    const partiallyBlockedCenters = centerStatuses.filter(c => c.status === 'partially_blocked');
    const availableCenters = centerStatuses.filter(c => c.status === 'available');
    const errorCenters = centerStatuses.filter(c => c.status === 'error');

    res.json({ 
      doctorId,
      doctorName: doctor.name,
      date,
      summary: {
        total: centerStatuses.length,
        fullyBlocked: blockedCenters.length,
        partiallyBlocked: partiallyBlockedCenters.length,
        available: availableCenters.length,
        errors: errorCenters.length
      },
      centers: {
        fullyBlocked: blockedCenters,
        partiallyBlocked: partiallyBlockedCenters,
        available: availableCenters,
        errors: errorCenters
      },
      allCenters: centerStatuses
    });
  } catch (error) {
    logger.error("Error getting doctor centers status:", error);
    res.status(500).json({ error: "Failed to get centers status" });
  }
});

// Helper function to check for slot conflicts
function checkSlotConflicts(newSlotTime, existingSlots, appointments = []) {
  const { timeToMinutes, minutesToTime } = require('../utils/slotUtils');
  const newSlotMinutes = timeToMinutes(newSlotTime);
  
  // Get all booked appointment times
  const bookedTimes = appointments.map(apt => apt.appointmentTime);
  
  // Check for conflicts with existing slots and appointments
  const conflicts = [];
  
  // For consultation appointments (30 min), check if the new slot conflicts
  // For assessment appointments (60 min), check broader range
  
  for (const slot of existingSlots) {
    const slotMinutes = timeToMinutes(slot.time);
    const timeDiff = Math.abs(newSlotMinutes - slotMinutes);
    
    // If slots are less than 30 minutes apart, check for conflicts
    if (timeDiff < 30 && timeDiff > 0) {
      conflicts.push({
        conflictingSlot: slot.time,
        reason: 'Too close to existing slot (less than 30 minutes apart)'
      });
    }
    
    // Check if this slot is booked and what type of appointment
    if (bookedTimes.includes(slot.time)) {
      const appointment = appointments.find(apt => apt.appointmentTime === slot.time);
      if (appointment) {
        // For assessment appointments, they block the next 30 minutes too
        if (appointment.consultationType !== 'New Consultation') {
          const assessmentEndMinutes = slotMinutes + 60;
          if (newSlotMinutes >= slotMinutes && newSlotMinutes < assessmentEndMinutes) {
            conflicts.push({
              conflictingSlot: slot.time,
              reason: `Conflicts with assessment appointment (${slot.time} to ${minutesToTime(assessmentEndMinutes)})`
            });
          }
        } else {
          // For consultation, just check the 30-minute slot
          if (timeDiff < 30) {
            conflicts.push({
              conflictingSlot: slot.time,
              reason: `Conflicts with consultation appointment at ${slot.time}`
            });
          }
        }
      }
    }
  }
  
  return conflicts;
}


// Add a new slot to specific date configuration
router.post("/add-slot", auth, async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { doctorId, centreId, date, slotTime, addAllCenters = false } = req.body;
    
    if (!doctorId || !date || !slotTime) {
      return res.status(400).json({ error: "Missing required fields: doctorId, date, slotTime" });
    }

    if (!addAllCenters && !centreId) {
      return res.status(400).json({ error: "Missing required field: centreId (or set addAllCenters=true)" });
    }

    const targetDate = new Date(date + 'T00:00:00.000Z');

    let result = {};

    if (addAllCenters) {
      // Add slot across ALL centers for this doctor
      const allCentres = await Centre.find({});
      
      for (const centre of allCentres) {
        let slotConfig = await SlotConfiguration.findOne({
          doctorId,
          centreId: centre._id,
          date: targetDate
        });

        if (!slotConfig) {
          // Create new configuration with default slots plus the new one
          const allSlots = [...DEFAULT_TIME_SLOTS];
          if (!DEFAULT_TIME_SLOTS.includes(slotTime)) {
            allSlots.push(slotTime);
            // Sort slots by time to maintain proper order
            allSlots.sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
          }
          
          slotConfig = new SlotConfiguration({
            doctorId,
            centreId: centre._id,
            date: targetDate,
            availableSlots: allSlots.map(time => ({
              time,
              isActive: true,
              isBlocked: false,
              blockReason: ''
            })),
            isOperational: true
          });
        } else {
          // Add slot if it doesn't exist
          const existingSlot = slotConfig.availableSlots.find(s => s.time === slotTime);
          if (!existingSlot) {
            slotConfig.availableSlots.push({
              time: slotTime,
              isActive: true,
              isBlocked: false,
              blockReason: ''
            });
            
            // Sort slots by time to maintain proper order
            slotConfig.availableSlots.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
          }
        }
        await slotConfig.save();
      }
      result.message = `Slot added across all centers for doctor`;
      result.centresAffected = allCentres.length;
    } else {
      // Add slot only in specific center
      let slotConfig = await SlotConfiguration.findOne({
        doctorId,
        centreId,
        date: targetDate
      });

      if (!slotConfig) {
        // Create new configuration with default slots plus the new one
        const allSlots = [...DEFAULT_TIME_SLOTS];
        if (!DEFAULT_TIME_SLOTS.includes(slotTime)) {
          allSlots.push(slotTime);
          // Sort slots by time to maintain proper order
          allSlots.sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
        }
        
        slotConfig = new SlotConfiguration({
          doctorId,
          centreId,
          date: targetDate,
          availableSlots: allSlots.map(time => ({
            time,
            isActive: true,
            isBlocked: false,
            blockReason: ''
          })),
          isOperational: true
        });
      } else {
        // Add slot if it doesn't exist
        const existingSlot = slotConfig.availableSlots.find(s => s.time === slotTime);
        if (!existingSlot) {
          slotConfig.availableSlots.push({
            time: slotTime,
            isActive: true,
            isBlocked: false,
            blockReason: ''
          });
          
          // Sort slots by time to maintain proper order
          slotConfig.availableSlots.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
        }
      }
      await slotConfig.save();
      result.message = `Slot added in specific center only`;
    }

    res.json(result);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Failed to add slot" });
  }
});

// Remove a slot from specific date configuration
router.post("/remove-slot", auth, async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { doctorId, centreId, date, slotTime, removeAllCenters = false } = req.body;
    
    if (!doctorId || !date || !slotTime) {
      return res.status(400).json({ error: "Missing required fields: doctorId, date, slotTime" });
    }

    if (!removeAllCenters && !centreId) {
      return res.status(400).json({ error: "Missing required field: centreId (or set removeAllCenters=true)" });
    }

    const targetDate = new Date(date + 'T00:00:00.000Z');

    let result = {};

    if (removeAllCenters) {
      // Remove slot across ALL centers for this doctor
      const allCentres = await Centre.find({});
      let totalRemoved = 0;
      
      for (const centre of allCentres) {
        let slotConfig = await SlotConfiguration.findOne({
          doctorId,
          centreId: centre._id,
          date: targetDate
        });

        if (!slotConfig) {
          // No configuration exists, create one with default slots first
          slotConfig = new SlotConfiguration({
            doctorId,
            centreId: centre._id,
            date: targetDate,
            availableSlots: DEFAULT_TIME_SLOTS.map(time => ({
              time,
              isActive: true,
              isBlocked: false,
              blockReason: ''
            })),
            isOperational: true,
            operationalReason: ''
          });
        }

        // Check if the slot exists and remove it
        const slotExists = slotConfig.availableSlots.some(s => s.time === slotTime);
        if (slotExists) {
          const initialLength = slotConfig.availableSlots.length;
          slotConfig.availableSlots = slotConfig.availableSlots.filter(s => s.time !== slotTime);
          
          if (slotConfig.availableSlots.length < initialLength) {
            await slotConfig.save();
            totalRemoved++;
          }
        }
      }
      result.message = `Slot removed from ${totalRemoved} centers`;
      result.centresAffected = totalRemoved;
    } else {
      // Remove slot only from specific center
      let slotConfig = await SlotConfiguration.findOne({
        doctorId,
        centreId,
        date: targetDate
      });

      if (!slotConfig) {
        // No configuration exists, create one with default slots first
        slotConfig = new SlotConfiguration({
          doctorId,
          centreId,
          date: targetDate,
          availableSlots: DEFAULT_TIME_SLOTS.map(time => ({
            time,
            isActive: true,
            isBlocked: false,
            blockReason: ''
          })),
          isOperational: true,
          operationalReason: ''
        });
      }

      // Check if the slot exists in the configuration (default or existing)
      const slotExists = slotConfig.availableSlots.some(s => s.time === slotTime);
      if (!slotExists) {
        return res.status(404).json({ error: "Slot time not found in available slots" });
      }

      // Remove the slot
      const initialLength = slotConfig.availableSlots.length;
      slotConfig.availableSlots = slotConfig.availableSlots.filter(s => s.time !== slotTime);
      
      if (slotConfig.availableSlots.length === initialLength) {
        return res.status(404).json({ error: "Slot not found in this center's configuration" });
      }

      await slotConfig.save();
      result.message = `Slot removed from specific center only`;
    }

    res.json(result);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Failed to remove slot" });
  }
});

// Set operational status for a specific doctor/centre/date
router.post("/set-operational-status", auth, async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { doctorId, centreId, date, isOperational, reason, setAllCenters = false } = req.body;
    
    if (!doctorId || !date || typeof isOperational !== 'boolean') {
      return res.status(400).json({ error: "Missing required fields: doctorId, date, isOperational" });
    }

    if (!setAllCenters && !centreId) {
      return res.status(400).json({ error: "Missing required field: centreId (or set setAllCenters=true)" });
    }

    const targetDate = new Date(date + 'T00:00:00.000Z');

    let result = {};

    if (setAllCenters) {
      // Set operational status across ALL centers for this doctor
      const allCentres = await Centre.find({});
      
      for (const centre of allCentres) {
        let slotConfig = await SlotConfiguration.findOne({
          doctorId,
          centreId: centre._id,
          date: targetDate
        });

        if (!slotConfig) {
          // Create new configuration
          slotConfig = new SlotConfiguration({
            doctorId,
            centreId: centre._id,
            date: targetDate,
            availableSlots: DEFAULT_TIME_SLOTS.map(time => ({
              time,
              isActive: true,
              isBlocked: false,
              blockReason: ''
            })),
            isOperational,
            operationalReason: reason || ''
          });
        } else {
          slotConfig.isOperational = isOperational;
          slotConfig.operationalReason = reason || '';
        }
        await slotConfig.save();
      }
      result.message = `Operational status ${isOperational ? 'enabled' : 'disabled'} across all centers`;
      result.centresAffected = allCentres.length;
    } else {
      // Set operational status only for specific center
      let slotConfig = await SlotConfiguration.findOne({
        doctorId,
        centreId,
        date: targetDate
      });

      if (!slotConfig) {
        // Create new configuration
        slotConfig = new SlotConfiguration({
          doctorId,
          centreId,
          date: targetDate,
          availableSlots: DEFAULT_TIME_SLOTS.map(time => ({
            time,
            isActive: true,
            isBlocked: false,
            blockReason: ''
          })),
          isOperational,
          operationalReason: reason || ''
        });
      } else {
        slotConfig.isOperational = isOperational;
        slotConfig.operationalReason = reason || '';
      }
      await slotConfig.save();
      result.message = `Operational status ${isOperational ? 'enabled' : 'disabled'} for specific center`;
      result.slotConfig = slotConfig;
    }

    res.json(result);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Failed to set operational status" });
  }
});

// Get all slot configurations for a doctor across all centres
router.get("/doctor-slots/:doctorId", auth, async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { doctorId } = req.params;
    const { startDate, endDate, centreId } = req.query;

    // Build query filter
    const filter = { doctorId };
    
    if (centreId) {
      filter.centreId = centreId;
    }
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filter.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const slotConfigs = await SlotConfiguration.find(filter)
      .populate('doctorId', 'name email')
      .populate('centreId', 'name')
      .sort({ date: 1 });

    res.json(slotConfigs);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Failed to fetch doctor slot configurations" });
  }
});

// Get all doctors for slot management
router.get("/doctors", auth, async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const Doctor = require("../models/User").Doctor;
    const doctors = await Doctor.find({ role: "doctor" })
      .select('name email mobilenumber centreIds')
      .populate('centreIds', 'name')
      .sort({ name: 1 });

    res.json(doctors);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Failed to fetch doctors" });
  }
});

// Get slot management overview for all doctors
router.get("/slots-overview", auth, async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { startDate, endDate, centreId } = req.query;
    
    // Build match filter
    const matchFilter = {};
    if (startDate || endDate) {
      matchFilter.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        matchFilter.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchFilter.date.$lte = end;
      }
    }
    
    if (centreId) {
      matchFilter.centreId = new mongoose.Types.ObjectId(centreId);
    }

    // Aggregate slot configurations by doctor
    const overview = await SlotConfiguration.aggregate([
      ...(Object.keys(matchFilter).length > 0 ? [{ $match: matchFilter }] : []),
      {
        $group: {
          _id: "$doctorId",
          totalConfigurations: { $sum: 1 },
          totalSlots: { $sum: { $size: "$availableSlots" } },
          blockedSlots: {
            $sum: {
              $size: {
                $filter: {
                  input: "$availableSlots",
                  cond: { $eq: ["$$this.isBlocked", true] }
                }
              }
            }
          },
          dateRange: { $push: "$date" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "doctor"
        }
      },
      {
        $project: {
          doctorName: { $arrayElemAt: ["$doctor.name", 0] },
          doctorEmail: { $arrayElemAt: ["$doctor.email", 0] },
          totalConfigurations: 1,
          totalSlots: 1,
          blockedSlots: 1,
          activeSlots: { $subtract: ["$totalSlots", "$blockedSlots"] },
          firstDate: { $min: "$dateRange" },
          lastDate: { $max: "$dateRange" }
        }
      },
      { $sort: { doctorName: 1 } }
    ]);

    res.json(overview);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Failed to fetch slots overview" });
  }
});

// ===== DOCTOR REGISTRATION ROUTES =====

// Register a new doctor (SuperAdmin only)
router.post("/register-doctor", auth, verifySuperAdmin, async (req, res) => {
  try {
    const { 
      name, 
      email, 
      mobilenumber, 
      password, 
      centreIds = [], 
      designation = '', 
      qualification = '' 
    } = req.body;

    // Validation
    if (!name || !mobilenumber || !password) {
      return res.status(400).json({ 
        error: "Missing required fields: name, mobilenumber, password" 
      });
    }

    if (!centreIds || centreIds.length === 0) {
      return res.status(400).json({ 
        error: "At least one center must be selected" 
      });
    }

    // Check if mobile already exists and email if provided
    const existingUserQuery = { mobilenumber: mobilenumber };
    if (email && email.trim()) {
      const emailExistsQuery = { email: email };
      const existingEmailUser = await User.findOne(emailExistsQuery);
      if (existingEmailUser) {
        return res.status(400).json({ 
          error: "A user with this email already exists" 
        });
      }
    }
    
    const existingUser = await User.findOne(existingUserQuery);

    if (existingUser) {
      return res.status(400).json({ 
        error: "A user with this mobile number already exists" 
      });
    }

    // Validate all center IDs exist
    const validCentres = await Centre.find({ _id: { $in: centreIds } });
    if (validCentres.length !== centreIds.length) {
      return res.status(400).json({ 
        error: "One or more invalid center IDs provided" 
      });
    }

    // Create new doctor
    const doctor = new Doctor({
      name,
      email,
      mobilenumber,
      password: await bcrypt.hash(password, 8),
      role: 'doctor',
      centreIds,
      designation,
      qualification,
      patients: []
    });

    await doctor.save();

    // Add doctor to each selected center
    for (const centreId of centreIds) {
      const centre = await Centre.findById(centreId);
      if (centre && !centre.doctors.includes(doctor._id)) {
        centre.doctors.push(doctor._id);
        await centre.save();
      }
    }

    // Send welcome email if email is provided
    if (email && email.trim()) {
      const centreNames = validCentres.map(c => c.name).join(', ');
      try {
        await mailUtility(
          email,
          "Welcome to Total Solutions!",
          `Dear Dr. ${name},

Welcome to Total Solutions! Your doctor account has been created successfully.

Login Credentials:
Mobile Number: ${mobilenumber}
Password: ${password}

You have been assigned to the following centers: ${centreNames}

Best regards,
Total Solutions Team`
        );
      } catch (emailError) {
        logger.error('Failed to send welcome email:', emailError);
        // Continue without failing the registration
      }
    }

    // Return success response without password
    const { password: _, ...doctorResponse } = doctor.toObject();
    doctorResponse.centres = validCentres;

    res.status(201).json({
      message: "Doctor registered successfully",
      doctor: doctorResponse
    });

  } catch (error) {
    logger.error("Error registering doctor:", error);
    res.status(500).json({ error: "Failed to register doctor" });
  }
});

// Get all doctors with their assigned centers
router.get("/doctors-list", auth, verifySuperAdmin, async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate('centreIds', 'name location')
      .populate('patients', 'name')
      .select('-password')
      .sort({ name: 1 });

    res.json(doctors);
  } catch (error) {
    logger.error("Error fetching doctors:", error);
    res.status(500).json({ error: "Failed to fetch doctors" });
  }
});

// Update doctor's assigned centers
router.put("/update-doctor-centers/:doctorId", auth, verifySuperAdmin, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { centreIds } = req.body;

    if (!centreIds || !Array.isArray(centreIds)) {
      return res.status(400).json({ error: "centreIds must be an array" });
    }

    // Find the doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // Validate all center IDs exist
    const validCentres = await Centre.find({ _id: { $in: centreIds } });
    if (validCentres.length !== centreIds.length) {
      return res.status(400).json({ error: "One or more invalid center IDs" });
    }

    // Remove doctor from old centers
    const oldCentres = await Centre.find({ _id: { $in: doctor.centreIds } });
    for (const centre of oldCentres) {
      centre.doctors = centre.doctors.filter(id => !id.equals(doctor._id));
      await centre.save();
    }

    // Add doctor to new centers
    for (const centreId of centreIds) {
      const centre = await Centre.findById(centreId);
      if (centre && !centre.doctors.includes(doctor._id)) {
        centre.doctors.push(doctor._id);
        await centre.save();
      }
    }

    // Update doctor's centreIds
    doctor.centreIds = centreIds;
    await doctor.save();

    // Return updated doctor with populated centers
    const updatedDoctor = await Doctor.findById(doctorId)
      .populate('centreIds', 'name location')
      .select('-password');

    res.json({
      message: "Doctor centers updated successfully",
      doctor: updatedDoctor
    });

  } catch (error) {
    logger.error("Error updating doctor centers:", error);
    res.status(500).json({ error: "Failed to update doctor centers" });
  }
});


module.exports = router;
