    import express from "express";
import Upload from "../models/Upload.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import { protect } from "../middleware/auth.js";
import { canAccessProject, isSameId } from "../utils/permissions.js";

const router = express.Router();

router.get("/:id", protect, async (req, res) => {
  const upload = await Upload.findById(req.params.id);

  if (!upload) {
    return res.status(404).json({ message: "Upload not found" });
  }

  if (isSameId(upload.owner, req.user._id)) {
    return res.json({ upload });
  }

  if (upload.relatedModel === "Project") {
    const project = await Project.findById(upload.relatedId);
    if (project && canAccessProject(req.user._id, project)) {
      return res.json({ upload });
    }
  }

  if (upload.relatedModel === "Task") {
    const task = await Task.findById(upload.relatedId);
    if (task) {
      const project = await Project.findById(task.project);
      if (project && canAccessProject(req.user._id, project)) {
        return res.json({ upload });
      }
    }
  }

  res.status(403).json({ message: "Forbidden" });
});

export default router;