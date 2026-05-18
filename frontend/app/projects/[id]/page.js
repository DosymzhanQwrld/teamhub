"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "../../../components/AuthGuard";
import TaskCard from "../../../components/TaskCard";
import ChatBox from "../../../components/ChatBox";
import OnlineUsers from "../../../components/OnlineUsers";
import UploadButton from "../../../components/UploadButton";
import { api } from "../../../lib/api";
import { useSocket } from "../../../context/SocketContext";
import { useAuth } from "../../../context/AuthContext";
import styles from "../../../styles/project.module.css";

export default function ProjectDetailsPage({ params }) {
  const projectId = params.id;
  const { user } = useAuth();
  const { connect, disconnect, socket } = useSocket();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [previewCover, setPreviewCover] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium"
  });
  const [filters, setFilters] = useState({ search: "", status: "", priority: "" });

  async function loadProject() {
    const data = await api(`/projects/${projectId}`);
    setProject(data.project);
  }

  async function loadTasks() {
    const query = new URLSearchParams(filters).toString();
    const data = await api(`/tasks/project/${projectId}?${query}`);
    setTasks(data.tasks);
  }

  async function updateProjectStatus(newStatus) {
    try {
      const data = await api(`/projects/${projectId}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus })
      });
      if (data?.project) {
        setProject(data.project);
      }
    } catch (error) {
      console.error("Failed to update project status:", error);
    }
  }

  async function handleJoinProject() {
    try {
      const data = await api(`/projects/${projectId}/join`, { method: "POST" });
      if (data?.project) {
        setProject(data.project);
        loadTasks();
        connect(projectId);
      }
    } catch (error) {
      console.error("Failed to join project:", error);
    }
  }

  async function saveCover(file) {
    try {
      const data = await api(`/projects/${projectId}/cover`, {
        method: "PUT",
        body: JSON.stringify({
          url: file.url,
          key: file.key,
          fileName: file.name,
          fileType: file.type || "image/png"
        })
      });
      if (data?.project) {
        setProject(data.project);
        setPreviewCover(null);
      }
    } catch (error) {
      console.error(error);
      setPreviewCover(null);
    }
  }

  async function createTask(e) {
    e.preventDefault();
    await api("/tasks", {
      method: "POST",
      body: JSON.stringify({ ...taskForm, projectId })
    });
    setTaskForm({ title: "", description: "", status: "todo", priority: "medium" });
  }

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const projectOwnerId = project?.owner?._id || project?.owner;
  const isOwner = String(projectOwnerId) === String(user?._id);
  const isMember = project?.members?.some(m => String(m._id || m) === String(user?._id));

  useEffect(() => {
    if (project && isMember) {
      loadTasks();
    }
  }, [project, isMember]);

  useEffect(() => {
    if (project && isMember) {
      connect(projectId);
      return () => {
        disconnect();
      };
    }
  }, [project, isMember]);

  useEffect(() => {
    if (!socket) return;

    const handleSocketMessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "project_members_updated") {
          setProject(data.project);
        }

        if (data.type === "task_created") {
          setTasks((prev) => [data.task, ...prev]);
        }

        if (data.type === "task_updated") {
          setTasks((prev) => prev.map((t) => (t._id === data.task._id ? data.task : t)));
        }

        if (data.type === "task_deleted") {
          setTasks((prev) => prev.filter((t) => t._id !== data.taskId));
        }
      } catch (err) {
        console.error("Error parsing socket message:", err);
      }
    };

    socket.addEventListener("message", handleSocketMessage);

    return () => {
      socket.removeEventListener("message", handleSocketMessage);
    };
  }, [socket]);

  if (!project) return <AuthGuard><main className="container">Loading...</main></AuthGuard>;

  return (
    <AuthGuard>
      <main className="container">
        <section className={styles.header} style={{ position: "relative" }}>
          <div>
            <h1>{project.title}</h1>
            <p>{project.description}</p>
            
            <div style={{ marginTop: "10px", fontSize: "16px" }}>
              <span>Status: </span>
              {isOwner ? (
                <select 
                  value={project.status?.toLowerCase()} 
                  onChange={(e) => updateProjectStatus(e.target.value)}
                  style={{ 
                    padding: "6px 12px", 
                    borderRadius: "6px", 
                    border: "1px solid #cbd5e1", 
                    backgroundColor: "#fff",
                    fontWeight: "600",
                    cursor: "pointer",
                    textTransform: "capitalize"
                  }}
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              ) : (
                <strong style={{ textTransform: "capitalize" }}>{project.status}</strong>
              )}
            </div>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-end" }}>
            {(previewCover || project.coverUrl) && (
              <img src={previewCover || project.coverUrl} alt={project.title} style={{ width: "200px", height: "100px", objectFit: "cover", borderRadius: "6px" }} />
            )}
            {isMember && isOwner && (
              <UploadButton endpoint="attachmentUploader" onUploaded={saveCover} onLocalSelect={(url) => setPreviewCover(url)}>
                Change Cover
              </UploadButton>
            )}
          </div>
        </section>

        <section style={{ margin: "20px 0" }}>
          <h3>Project Members</h3>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
            {project.members?.map((member) => (
              <Link 
                href={`/users/${member._id}`} 
                key={member._id}
                style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: "8px", padding: "5px 10px", border: "1px solid #e2e8f0", borderRadius: "20px", cursor: "pointer" }}
              >
                <img 
                  src={member.avatarUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                  alt={member.name} 
                  style={{ width: "24px", height: "24px", borderRadius: "50%" }}
                />
                <span>{member.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {!isMember ? (
          <div style={{ textAlign: "center", padding: "40px", border: "1px dashed #cbd5e1", borderRadius: "8px", marginTop: "20px" }}>
            <h2>You are not a member of this project yet</h2>
            <p style={{ color: "#64748b", marginBottom: "20px" }}>Join the project to view the chat, see team members, and look through assigned tasks.</p>
            <button onClick={handleJoinProject} style={{ padding: "10px 30px", fontSize: "16px", cursor: "pointer" }}>
              Join Project
            </button>
          </div>
        ) : (
          <>
            <OnlineUsers />

            {isOwner && (
              <form className={styles.form} onSubmit={createTask}>
                <input
                  placeholder="Task title"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                />
                <textarea
                  placeholder="Task description"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                />
                <select value={taskForm.status} onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}>
                  <option value="todo">Todo</option>
                  <option value="in-progress">In progress</option>
                  <option value="done">Done</option>
                </select>
                <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <button>Create task</button>
              </form>
            )}

            <section className={styles.filters}>
              <input
                placeholder="Search tasks"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
              <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                <option value="">All status</option>
                <option value="todo">Todo</option>
                <option value="in-progress">In progress</option>
                <option value="done">Done</option>
              </select>
              <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
                <option value="">All priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <button onClick={loadTasks}>Apply</button>
            </section>

            <section className={styles.grid}>
              {tasks.map((task) => (
                <TaskCard 
                  key={task._id} 
                  task={task} 
                  onChanged={loadTasks} 
                  projectOwnerId={projectOwnerId} 
                />
              ))}
            </section>

            <ChatBox projectId={projectId} />
          </>
        )}
      </main>
    </AuthGuard>
  );
}