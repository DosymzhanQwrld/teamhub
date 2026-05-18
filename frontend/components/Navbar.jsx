"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/layout.module.css";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className={styles.navbar}>
      <Link href="/" className={styles.logo}>TeamHub</Link>
      <nav>
        {user ? (
          <>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/projects">Projects</Link>
            <Link href="/profile">Profile</Link>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
