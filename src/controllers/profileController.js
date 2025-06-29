// Profile Upload API

import supabase from "../config/supabase";
import path from "path";
import User from "../models/user";

export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Validate file size (redundant but good practice)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ message: "File size exceeds 5MB limit" });
    }

    const ext = path.extname(req.file.originalname);
    const fileName = `profile-${req.user.id}-${Date.now()}${ext}`;
    const filePath = `profile_images/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("quick-cart") //bucket name in supabase
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    if (error) throw error;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("quick-cart").getPublicUrl(filePath);

    //Update user profile in DB (pseudo-code)
    await User.findByIdAndUpdate(req.user.id, {
      profileImage: publicUrl,
    });

    res.json({
      success: true,
      message: "Image Uploaded",
      imageUrl: publicUrl,
      fileName,
    });
  } catch (err) {
    //res.status(500).json({ message: "Upload failed", error: err.message });

    console.error("Upload error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to upload profile image",
      error: process.env.NODE_ENV === "development" ? err.message : null,
    });
  }
};
