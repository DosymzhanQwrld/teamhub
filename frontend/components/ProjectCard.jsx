import Link from "next/link";
import styles from "../styles/dashboard.module.css";

export default function ProjectCard({ project }) {
  return (
    <article className={styles.projectCard}>
      {project.coverUrl && <img src={project.coverUrl} alt={project.title} />}
      <h2>{project.title}</h2>
      <p>{project.description}</p>
      <span>{project.status}</span>
      <Link href={`/projects/${project._id}`}>Open</Link>
    </article>
  );
}
