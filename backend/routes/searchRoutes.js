const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { searchAcademicContent } = require("../controllers/searchController");

const router = express.Router();

router.use(protect);

router.get("/", searchAcademicContent);

module.exports = router;
