const Report = require("../models/Report");
const uploadToCloudinary = require("../config/uploadToCloudinary");

// Create a new report
const createReport = async (req, res) => {
  try {
    const title = req.body.title?.trim();
    const description = req.body.description?.trim();
    const category = req.body.category;

    let location;

    try {
      location =
        typeof req.body.location === "string"
          ? JSON.parse(req.body.location)
          : req.body.location;
    } catch (error) {
      return res.status(400).json({
        message: "Invalid location data",
      });
    }

    if (!title || !description || !category || !location?.address?.trim()) {
      return res.status(400).json({
        message: "Please provide title, description, category, and location",
      });
    }

    const allowedCategories = [
      "garbage",
      "illegal_dumping",
      "damaged_public_property",
      "overflowing_bin",
      "other",
    ];

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        message: "Invalid report category",
      });
    }

    let latitude;
    let longitude;

    if (location.latitude !== undefined && location.latitude !== "") {
      latitude = Number(location.latitude);

      if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
        return res.status(400).json({
          message: "Invalid latitude",
        });
      }
    }

    if (location.longitude !== undefined && location.longitude !== "") {
      longitude = Number(location.longitude);

      if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
        return res.status(400).json({
          message: "Invalid longitude",
        });
      }
    }

    let imageUrl = "";

    if (req.file) {
      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        "green-sweep/reports",
      );

      imageUrl = uploadResult.secure_url;
    }

    const report = await Report.create({
      title,
      description,
      category,
      imageUrl,
      location: {
        address: location.address.trim(),
        latitude,
        longitude,
      },
      reportedBy: req.user.userId,
    });

    res.status(201).json({
      message: "Report created successfully",
      report,
    });
  } catch (error) {
    console.error("Create report error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Get all reports
const getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("reportedBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: reports.length,
      reports,
    });
  } catch (error) {
    console.error("Get reports error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Get single report
const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("reportedBy", "name email")
      .populate("assignedTo", "name email");

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    res.status(200).json({
      report,
    });
  } catch (error) {
    console.error("Get report error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Update report status
const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "reported",
      "under_review",
      "assigned",
      "cleanup_in_progress",
      "completed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid report status",
      });
    }

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    report.status = status;

    await report.save();

    res.status(200).json({
      message: "Report status updated successfully",
      report,
    });
  } catch (error) {
    console.error("Update report status error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Assign a report to a municipal user
const assignReport = async (req, res) => {
  try {
    const { municipalUserId } = req.body;

    if (!municipalUserId) {
      return res.status(400).json({
        message: "Please provide a municipal user ID",
      });
    }

    const User = require("../models/User");

    const municipalUser = await User.findById(municipalUserId);

    if (!municipalUser) {
      return res.status(404).json({
        message: "Municipal user not found",
      });
    }

    if (municipalUser.role !== "municipal") {
      return res.status(400).json({
        message: "Selected user is not a municipal user",
      });
    }

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    report.assignedTo = municipalUser._id;
    report.status = "assigned";

    await report.save();

    const updatedReport = await Report.findById(report._id)
      .populate("reportedBy", "name email")
      .populate("assignedTo", "name email");

    res.status(200).json({
      message: "Report assigned successfully",
      report: updatedReport,
    });
  } catch (error) {
    console.error("Assign report error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  createReport,
  getReports,
  getReportById,
  updateReportStatus,
  assignReport,
};
