const Cleanup = require("../models/Cleanup");
const Report = require("../models/Report");
const User = require("../models/User");
const uploadToCloudinary = require("../config/uploadToCloudinary");

// Claim a report for cleanup
const claimCleanup = async (req, res) => {
  try {
    const { reportId } = req.body;

    if (!reportId) {
      return res.status(400).json({
        message: "Please provide a report ID",
      });
    }

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    if (report.status === "completed") {
      return res.status(400).json({
        message: "This report has already been completed",
      });
    }

    const existingCleanup = await Cleanup.findOne({
      report: reportId,
      volunteer: req.user.userId,
    });

    if (existingCleanup) {
      return res.status(400).json({
        message: "You have already claimed this report",
      });
    }

    const cleanup = await Cleanup.create({
      report: reportId,
      volunteer: req.user.userId,
    });

    report.status = "cleanup_in_progress";

    await report.save();

    const populatedCleanup = await Cleanup.findById(cleanup._id)
      .populate("volunteer", "name email")
      .populate("report", "title description category status");

    res.status(201).json({
      message: "Cleanup claimed successfully",
      cleanup: populatedCleanup,
    });
  } catch (error) {
    console.error("Claim cleanup error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Get all cleanups
const getCleanups = async (req, res) => {
  try {
    const cleanups = await Cleanup.find()
      .populate("volunteer", "name email points")
      .populate("report", "title category status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: cleanups.length,
      cleanups,
    });
  } catch (error) {
    console.error("Get cleanups error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Submit cleanup
const submitCleanup = async (req, res) => {
  try {
    const cleanup = await Cleanup.findById(req.params.id);

    if (!cleanup) {
      return res.status(404).json({
        message: "Cleanup not found",
      });
    }

    if (cleanup.volunteer.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You can only submit your own cleanup",
      });
    }

    if (cleanup.status !== "claimed" && cleanup.status !== "in_progress") {
      return res.status(400).json({
        message: "Cleanup cannot be submitted in its current status",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a proof image",
      });
    }

    const uploadResult = await uploadToCloudinary(
      req.file.buffer,
      "green-sweep/cleanup-proofs",
    );

    cleanup.proofImage = uploadResult.secure_url;
    cleanup.status = "submitted";

    await cleanup.save();

    const updatedCleanup = await Cleanup.findById(cleanup._id)
      .populate("volunteer", "name email")
      .populate("report");

    res.status(200).json({
      message: "Cleanup submitted successfully",
      cleanup: updatedCleanup,
    });
  } catch (error) {
    console.error("Submit cleanup error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Verify cleanup and award points
const verifyCleanup = async (req, res) => {
  try {
    const cleanup = await Cleanup.findById(req.params.id);

    if (!cleanup) {
      return res.status(404).json({
        message: "Cleanup not found",
      });
    }

    if (cleanup.status === "verified") {
      return res.status(400).json({
        message: "Cleanup has already been verified",
      });
    }

    if (cleanup.status !== "submitted") {
      return res.status(400).json({
        message: "Cleanup must be submitted before verification",
      });
    }

    const volunteer = await User.findById(cleanup.volunteer);

    if (!volunteer) {
      return res.status(404).json({
        message: "Volunteer not found",
      });
    }

    const report = await Report.findById(cleanup.report);

    if (!report) {
      return res.status(404).json({
        message: "Associated report not found",
      });
    }

    const POINTS_FOR_CLEANUP = 50;

    cleanup.status = "verified";
    cleanup.pointsAwarded = POINTS_FOR_CLEANUP;
    cleanup.completedAt = new Date();

    volunteer.points += POINTS_FOR_CLEANUP;

    report.status = "completed";

    await cleanup.save();
    await volunteer.save();
    await report.save();

    const updatedCleanup = await Cleanup.findById(cleanup._id)
      .populate("volunteer", "name email points")
      .populate("report", "title category status");

    res.status(200).json({
      message: "Cleanup verified and points awarded",
      cleanup: updatedCleanup,
    });
  } catch (error) {
    console.error("Verify cleanup error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  claimCleanup,
  getCleanups,
  submitCleanup,
  verifyCleanup,
};
