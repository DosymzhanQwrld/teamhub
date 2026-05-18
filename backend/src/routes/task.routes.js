import express from "express";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import Upload from "../models/Upload.js";
import { protect } from "../middleware/auth.js";
import { canAccessProject, isSameId } from "../utils/permissions.js";

const router = express.Router();

function broadcastToProject(req, projectId, data) {
  const io = req.app.get("io");
  if (!io || !io.clients) return;

  io.clients.forEach((client) => {
    if (client.readyState === 1 && String(client.projectId) === String(projectId)) {
      client.send(JSON.stringify(data));
    }
  });
}

router.post("/", protect, async (req, res) => {
  const { title, description, projectId, assignees = [], status, priority, dueDate } = req.body;

  const project = await Project.findById(projectId);

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (!canAccessProject(req.user._id, project)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const task = await Task.create({
    title,
    description,
    project: projectId,
    creator: req.user._id,
    assignees,
    status,
    priority,
    dueDate
  });

  broadcastToProject(req, projectId, { type: "task_created", task });

  res.status(201).json({ task });
});

router.get("/project/:projectId", protect, async (req, res) => {
  const { status = "", priority = "", search = "" } = req.query;

  const project = await Project.findById(req.params.projectId);

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (!canAccessProject(req.user._id, project)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const query = { project: project._id };

  if (status) query.status = status;
  if (priority) query.priority = priority;

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
  }

  const tasks = await Task.find(query)
    .populate("creator", "name email avatarUrl")
    .populate("assignees", "name email avatarUrl")
    .sort({ updatedAt: -1 });

  res.json({ tasks });
});

router.put("/:id", protect, async (req, res) => {
  const task = await Task.findById(req.params.id);
  
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  const project = await Project.findById(task.project);

  if (!canAccessProject(req.user._id, project)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const allowed = ["title", "description", "status", "priority", "assignees", "dueDate"];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) task[field] = req.body[field];
  });

  await task.save();

  broadcastToProject(req, task.project, { type: "task_updated", task });

  res.json({ task });
});

router.delete("/:id", protect, async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  if (!isSameId(task.creator, req.user._id)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const projectId = task.project;
  await Task.findByIdAndDelete(task._id);

  broadcastToProject(req, projectId, { type: "task_deleted", taskId: task._id });

  res.json({ message: "Task deleted" });
});

router.put("/:id/attachment", protect, async (req, res) => {
  const { url, key, fileName, fileType } = req.body;

  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  const project = await Project.findById(task.project);

  if (!canAccessProject(req.user._id, project)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  task.attachmentUrls.push(url);
  await task.save();

  await Upload.create({
    url,
    key,
    fileName,
    fileType,
    purpose: "task-attachment",
    owner: req.user._id,
    relatedModel: "Task",
    relatedId: task._id,
    isPrivate: true
  });

  res.json({ task });
});

export default router;