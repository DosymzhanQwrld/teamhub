import express from "express";
import Project from "../models/Project.js";
import User from "../models/User.js";
import Upload from "../models/Upload.js";
import Task from "../models/Task.js";
import { protect } from "../middleware/auth.js";
import { canAccessProject, isSameId } from "../utils/permissions.js";
import { buildProjectSearchQuery } from "../utils/search.js";
import { notifyProjectUpdate } from "../websocket/wsServer.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
  const { title, description, members = [], status, tags = [], dueDate } = req.body;

  const project = await Project.create({
    title,
    description,
    owner: req.user._id,
    members: [...new Set([String(req.user._id), ...members])],
    status,
    tags,
    dueDate
  });

  await User.updateMany(
    { _id: { $in: project.members } },
    { $addToSet: { projects: project._id } }
  );

  res.status(201).json({ project });
});

router.get("/", protect, async (req, res) => {
  const { search = "", status = "" } = req.query;

  const query = buildProjectSearchQuery(req.user._id, search, status);

  const projects = await Project.find(query)
    .populate("owner", "name email avatarUrl")
    .populate("members", "name email avatarUrl")
    .sort({ updatedAt: -1 });

  res.json({ projects });
});

router.get("/:id", protect, async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate("owner", "name email avatarUrl")
    .populate("members", "name email avatarUrl");

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  res.json({ project });
});

router.put("/:id", protect, async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (!isSameId(project.owner, req.user._id)) {
    return res.status(403).json({ message: "Forbidden: Only owner can modify project metadata" });
  }

  const allowed = ["title", "description", "status", "tags", "dueDate", "members"];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) project[field] = req.body[field];
  });

  if (!project.members.some((member) => isSameId(member, req.user._id))) {
    project.members.push(req.user._id);
  }

  await project.save();

  await User.updateMany(
    { _id: { $in: project.members } },
    { $addToSet: { projects: project._id } }
  );

  res.json({ project });
});

router.delete("/:id", protect, async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (!isSameId(project.owner, req.user._id)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  await Project.findByIdAndDelete(project._id);
  await User.updateMany({}, { $pull: { projects: project._id } });

  res.json({ message: "Project deleted" });
});

router.put("/:id/cover", protect, async (req, res) => {
  const { url, key, fileName, fileType } = req.body;

  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (!isSameId(project.owner, req.user._id)) {
    return res.status(403).json({ message: "Forbidden: Only project creator can change the cover image" });
  }

  project.coverUrl = url;
  await project.save();

  await Upload.create({
    url,
    key,
    fileName,
    fileType,
    purpose: "project-cover",
    owner: req.user._id,
    relatedModel: "Project",
    relatedId: project._id,
    isPrivate: true
  });

  res.json({ project });
});

router.post("/:id/join", protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const userIdStr = String(req.user._id);

    if (project.members.some(m => String(m) === userIdStr)) {
      return res.status(400).json({ message: "You are already a member of this project" });
    }

    project.members.push(req.user._id);
    await project.save();

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { projects: project._id }
    });

    const updatedProject = await Project.findById(project._id)
      .populate("owner", "name email avatarUrl")
      .populate("members", "name email avatarUrl");

    notifyProjectUpdate(project._id, "project_members_updated", { project: updatedProject });

    res.json({ project: updatedProject });
  } catch (error) {
    console.error("Error joining project:", error);
    res.status(500).json({ message: "Server error during join" });
  }
});

export default router;