"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AuthGuard from "../../../components/AuthGuard";
import { api } from "../../../lib/api";

export default function UserProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadUserProfile() {
    try {
      const data = await api(`/users/${id}`);
      if (data?.user) {
        setProfile(data.user);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      loadUserProfile();
    }
  }, [id]);

  if (loading) return <AuthGuard><main className="container"><p>Loading profile...</p></main></AuthGuard>;
  if (!profile) return <AuthGuard><main className="container"><p>User not found.</p></main></AuthGuard>;

  return (
    <AuthGuard>
      <main className="container" style={{ maxWidth: "600px", marginTop: "40px" }}>
        <div style={{ padding: "30px", border: "1px solid #e2e8f0", borderRadius: "12px", backgroundColor: "#fff", textAlign: "center" }}>
          <img 
            src={profile.avatarUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
            alt={profile.name} 
            style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", marginBottom: "20px" }}
          />
          <h2>{profile.name}</h2>
          <p style={{ color: "#64748b", marginBottom: "15px" }}>{profile.email}</p>
          
          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "15px", marginTop: "15px", textAlign: "left" }}>
            <h4>Bio</h4>
            <p style={{ color: "#334155" }}>
              {profile.bio || "No bio provided yet."}
            </p>
          </div>

          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "15px", marginTop: "15px", textAlign: "left" }}>
            <h4>Projects ({profile.projects?.length || 0})</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}>
              {profile.projects?.map((proj) => (
                <Link 
                  href={`/projects/${proj._id}`} 
                  key={proj._id}
                  style={{ display: "flex", justifyContent: "space-between", padding: "10px", border: "1px solid #f1f5f9", borderRadius: "6px", textDecoration: "none", color: "inherit" }}
                >
                  <span style={{ fontWeight: "500" }}>{proj.title}</span>
                  <span style={{ fontSize: "12px", textTransform: "uppercase", color: "#64748b" }}>{proj.status}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}