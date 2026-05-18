import express from "express";
import Message from "../models/Message.js";
import Project from "../models/Project.js";
import { protect } from "../middleware/auth.js";
import { canAccessProject } from "../utils/permissions.js";

const router = express.Router();

router.get("/project/:projectId", protect, async (req, res) => {
  const project = await Project.findById(req.params.projectId);

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (!canAccessProject(req.user._id, project)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const messages = await Message.find({
    project: project._id,
    deleted: false
  })
    .populate("sender", "name email avatarUrl")
    .sort({ createdAt: 1 })
    .limit(100);

  res.json({ messages });
});

export default router;
