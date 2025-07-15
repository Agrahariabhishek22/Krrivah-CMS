const express = require("express");
const { upload } = require("../utils/cloudinary");
const catchMulterError = require("../middlewares/catchMulterError");
const { verifyToken, restrictTo } = require("../middlewares/authMiddleware");
const {
  createHeroBrand,
  updateHeroBrand,
  getAllHeroBrands,
  deleteHeroBrand,
} = require("../controllers/HeroBrandController");

const router = express.Router();
router.get('/', getAllHeroBrands);
router.post('/', upload.single('image'), createHeroBrand);
 router.put('/:id', updateHeroBrand); // Optional: can support image update
 router.delete('/:id', deleteHeroBrand);

module.exports=router
