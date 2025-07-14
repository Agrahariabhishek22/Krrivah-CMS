const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//  Cloudinary Storage Config
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const fileType = file.mimetype.startsWith("image/") ? "Images" : "Brochures";
    return {
      folder: `Krrivah/${fileType}`,
      resource_type: "auto", // handles image & pdf
      allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
    };
  },
});

// Multer Upload Config (includes size limit)
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, //  10MB limit
  },
  fileFilter: (req, file, cb) => {
//   console.log("Checking file: ", file.originalname, file.mimetype);
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf"
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    // console.error("Rejected file type:", file.mimetype);
    return cb(new Error("Only jpg, png, webp images and pdfs are allowed"));
  }

//   console.log("Accepted:", file.originalname);
  cb(null, true);
}
});


module.exports = { cloudinary, upload };
