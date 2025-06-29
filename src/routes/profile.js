import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import upload from "../middleware/upload";
import { uploadProfileImage } from "../controllers/profileController";

const router = express.Router();

router.post(
  "/upload",
  authMiddleware,
  upload.single("profileImage"),
  uploadProfileImage
);

export default router;
