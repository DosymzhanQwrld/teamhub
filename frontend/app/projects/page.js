"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "../../components/AuthGuard";
import ProjectCard from "../../components/ProjectCard";
import { api } from "../../lib/api";
import styles from "../../styles/project.module.css";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", status: "planning" });
  const [filters, setFilters] = useState({ search: "", status: "" });

  async function loadProjects() {
    const query = new URLSearchParams(filters).toString();
    const data = await api(`/projects?${query}`);
    setProjects(data.projects);
  }

  async function createProject(e) {
    e.preventDefault();

    await api("/projects", {
      method: "POST",
      body: JSON.stringify(form)
    });

    setForm({ title: "", description: "", status: "planning" });
    loadProjects();
  }

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <AuthGuard>
      <main className="container">
        <h1>Projects</h1>

        <form className={styles.form} onSubmit={createProject}>
          <input
            placeholder="Project title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
          <button>Create project</button>
        </form>

        <section className={styles.filters}>
          <input
            placeholder="Search"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All statuses</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
          <button onClick={loadProjects}>Apply</button>
        </section>

        <section className={styles.grid}>
          {projects.map((project) => (
            <Link 
              href={`/projects/${project._id}`} 
              key={project._id} 
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <ProjectCard project={project} />
            </Link>
          ))}
        </section>
      </main>
    </AuthGuard>
  );
}