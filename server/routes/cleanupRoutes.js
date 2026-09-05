const express = require("express");

const {
  claimCleanup,
  getCleanups,
  submitCleanup,
  verifyCleanup,
} = require("../controllers/cleanupController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/claim", protect, authorize("citizen"), claimCleanup);

router.get("/", protect, getCleanups);

router.put(
  "/:id/submit",
  protect,
  authorize("citizen"),
  upload.single("proofImage"),
  submitCleanup,
);

router.put(
  "/:id/verify",
  protect,
  authorize("municipal", "admin"),
  verifyCleanup,
);

module.exports = router;
