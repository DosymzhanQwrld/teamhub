"use client";

import { useSocket } from "../context/SocketContext";
import styles from "../styles/project.module.css";

export default function OnlineUsers() {
  const { onlineUsers } = useSocket();

  return (
    <section className={styles.onlineBox}>
      <h2>Online users</h2>
      <div className={styles.onlineList}>
        {onlineUsers.map((user) => (
          <div key={user.id} className={styles.onlineUser}>
            {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} /> : <span>{user.name[0]}</span>}
            <p>{user.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
