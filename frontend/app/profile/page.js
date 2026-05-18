"use client";

import { useState, useEffect } from "react";
import AuthGuard from "../../components/AuthGuard";
import UploadButton from "../../components/UploadButton";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import styles from "../../styles/auth.module.css";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: "", bio: "" });

  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        bio: user.bio || ""
      });
    }
  }, [user]);

  async function saveProfile(e) {
    e.preventDefault();
    const data = await api("/users/profile", {
      method: "PUT",
      body: JSON.stringify(form)
    });
    if (data?.user) {
      setUser(data.user);
    }
  }

  async function saveAvatar(res) {
    // Логируем ответ, чтобы увидеть структуру в консоли браузера (F12)
    console.log("Uploadthing response:", res);

    // Uploadthing возвращает массив файлов. Берем первый элемент.
    const file = Array.isArray(res) ? res[0] : res;
    
    if (!file || !file.url) {
      console.error("No file data received");
      return;
    }

    const data = await api("/users/avatar", {
      method: "PUT",
      body: JSON.stringify({
        url: file.url,
        key: file.key,
        fileName: file.name || "avatar.png",
        fileType: file.type || "image/png"
      })
    });

    if (data?.user) {
      setUser(data.user);
    }
  }

  return (
    <AuthGuard>
      <main className="container">
        <section className={styles.card}>
          <h1>Profile</h1>
          
          <img 
            className={styles.avatar} 
            src={user?.avatarUrl || defaultAvatar} 
            alt={user?.name || "Avatar"} 
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              objectFit: "cover",
              marginBottom: "15px"
            }}
          />

          <UploadButton endpoint="avatarUploader" onUploaded={saveAvatar}>
            Upload avatar
          </UploadButton>

          <form onSubmit={saveProfile}>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Name"
              required
            />
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Bio"
            />
            <button>Save</button>
          </form>
        </section>
      </main>
    </AuthGuard>
  );
}