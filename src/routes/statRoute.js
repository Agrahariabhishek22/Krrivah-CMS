const express = require("express");
const router = express.Router();
const {
  createStats,
  getStats,
  updateStats,
  deleteStats,
} = require("../controllers/statController");
const { verifyToken, restrictTo } = require("../middlewares/authMiddleware");


router.post("/", verifyToken, restrictTo("Admin", "Super_Admin"), createStats);
router.get("/", getStats);
router.put("/:id", verifyToken, restrictTo("Admin", "Super_Admin"), updateStats);
router.delete("/:id", verifyToken, restrictTo("Admin", "Super_Admin"), deleteStats);

module.exports = router;
