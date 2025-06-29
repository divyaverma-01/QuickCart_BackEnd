//multer code
//supabase upload || cloudanery

// upload.js
import multer from "multer";
import path from "path";

// Memory storage (we'll upload directly to Supabase)
const storage = multer.memoryStorage();

// File filter (optional)
const fileFilter = (req, file, cb) => {
  const allowedTypes = [".jpg", ".jpeg", ".png", ".webp"];
  const ext = path.extname(file.originalname).toLowerCase();
  allowedTypes.includes(ext)
    ? cb(null, true)
    : cb(
        new Error("Only image files (jpg, jpeg, png, webp) are allowed!"),
        false
      );
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}); //Creates a multer instance using storage and fileFilter

export default upload;
