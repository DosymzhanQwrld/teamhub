"use client";

import { useEffect, useState } from "react";
import AuthGuard from "../../components/AuthGuard";
import ProjectCard from "../../components/ProjectCard";
import { api } from "../../lib/api";
import styles from "../../styles/dashboard.module.css";

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);

  async function loadProjects() {
    const data = await api("/api/projects");
    setProjects(data.projects);
  }

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <AuthGuard>
      <main className="container">
        <h1>Dashboard</h1>
        <section className={styles.grid}>
          {projects.slice(0, 6).map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </section>
      </main>
    </AuthGuard>
  );
}
