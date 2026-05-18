"use client";

import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import styles from "../styles/project.module.css";

export default function TaskCard({ task, onChanged, projectOwnerId }) {
  const { user } = useAuth();

  const isOwner = String(projectOwnerId) === String(user?._id);

  async function updateStatus(status) {
    await api(`/tasks/${task._id}`, {
      method: "PUT",
      body: JSON.stringify({ status })
    });
    onChanged();
  }

  async function deleteTask() {
    await api(`/tasks/${task._id}`, {
      method: "DELETE"
    });
    onChanged();
  }

  return (
    <article className={styles.taskCard}>
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <div>
        <span>{task.status}</span>
        <span>{task.priority}</span>
      </div>
      {isOwner && (
        <>
          <select value={task.status} onChange={(e) => updateStatus(e.target.value)}>
            <option value="todo">Todo</option>
            <option value="in-progress">In progress</option>
            <option value="done">Done</option>
          </select>
          <button onClick={deleteTask}>Delete</button>
        </>
      )}
    </article>
  );
}