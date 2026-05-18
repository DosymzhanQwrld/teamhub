import express from "express";
import User from "../models/User.js";
import Upload from "../models/Upload.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/profile", protect, async (req, res) => {
  try {
    const { name, bio } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio },
      { new: true, runValidators: true }
    ).select("-password");
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/avatar", protect, async (req, res) => {
  try {
    const { url, key, fileName, fileType } = req.body;

    if (!url) {
      return res.status(400).json({ message: "URL is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatarUrl: url },
      { new: true }
    ).select("-password");

    await Upload.create({
      url,
      key: key || `key-${Date.now()}`,
      fileName: fileName || "avatar.png",
      fileType: fileType || "image/png",
      purpose: "avatar",
      owner: req.user._id,
      relatedModel: "User",
      relatedId: req.user._id,
      isPrivate: false
    });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", protect, async (req, res) => {
  try {
    const userProfile = await User.findById(req.params.id)
      .select("name email avatarUrl bio projects")
      .populate("projects", "title status");

    if (!userProfile) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: userProfile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;