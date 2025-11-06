import multer from "multer";

// Use memory storage so files are available in req.files[].buffer
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 4 * 1024 * 1024 }, // 4 MB per file
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"), false);
    }
    cb(null, true);
  },
});

// Middleware for multiple image uploads (max 5)
export const uploadImages = upload.array("images", 5);

export default upload;
