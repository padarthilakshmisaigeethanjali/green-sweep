const express = require("express");

const {
  createReport,
  getReports,
  getReportById,
  updateReportStatus,
  assignReport,
} = require("../controllers/reportController");

const protect = require("../middleware/authMiddleware");

const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", protect, createReport);

router.get("/", protect, getReports);

router.get("/:id", protect, getReportById);

router.put(
  "/:id/status",
  protect,
  authorize("municipal", "admin"),
  updateReportStatus,
);

router.put("/:id/assign", protect, authorize("admin"), assignReport);

module.exports = router;
