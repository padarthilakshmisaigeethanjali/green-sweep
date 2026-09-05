const express = require("express");

const authorize = require("../middleware/roleMiddleware");

const {
  registerUser,
  loginUser,
  getMe,
  getLeaderboard,
  getMunicipalUsers,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.get("/leaderboard", protect, getLeaderboard);

router.get("/municipal-users", protect, authorize("admin"), getMunicipalUsers);

module.exports = router;
