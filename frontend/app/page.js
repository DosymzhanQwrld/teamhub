import Link from "next/link";
import styles from "../styles/layout.module.css";

export default function HomePage() {
  return (
    <main className={styles.hero}>
      <section>
        <h1>TeamHub</h1>
        <p>Manage projects, tasks, files, and team conversations in one place.</p>
        <div className={styles.actions}>
          <Link href="/register">Get started</Link>
          <Link href="/login">Login</Link>
        </div>
      </section>
    </main>
  );
}
