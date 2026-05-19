"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import styles from "../../styles/auth.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) { 
    setError("Пароль должен содержать минимум 6 символов!"); 
    return; 
  }

    try {
      await register(form.name, form.email, form.password);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className={styles.authPage}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1>Create account</h1>
        {error && <p className={styles.error}>{error}</p>}
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button>Register</button>
      </form>
    </main>
  );
}
