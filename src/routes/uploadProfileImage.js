// src/routes/uploadProfileImage.js
import express from "express";
import upload from "../middleware/upload.js";
import supabase from "../config/supabase.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/test", (req, res) => {
  res.json({ ok: true });
});

router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const fileExt = req.file.originalname.split(".").pop();
  const fileName = `profile_images/${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 9)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from("quick-cart")
    .upload(fileName, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: false,
    });

  if (error) return res.status(500).json({ error: error.message });

  const { publicUrl } = supabase.storage
    .from("quick-cart")
    .getPublicUrl(fileName).data;
  res.json({ url: publicUrl });
});

export default router;
