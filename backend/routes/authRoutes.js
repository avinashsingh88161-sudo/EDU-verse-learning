const express = require("express");
const { signup, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Authentication Routes
router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, getMe);

module.exports = router;
