"use client";

import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
import { api } from "../lib/api";
import styles from "../styles/project.module.css";

export default function ChatBox({ projectId }) {
  const { messages, setMessages, sendMessage } = useSocket();
  const [text, setText] = useState("");

  async function loadMessages() {
    const data = await api(`/messages/project/${projectId}`);
    setMessages(data.messages);
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!text.trim()) return;

    sendMessage(text);
    setText("");
  }

  useEffect(() => {
    loadMessages();
  }, [projectId]);

  return (
    <section className={styles.chat}>
      <h2>Live chat</h2>
      <div className={styles.messages}>
        {messages.map((message) => (
          <div key={message._id} className={styles.message}>
            <strong>{message.sender?.name}</strong>
            <p>{message.text}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className={styles.chatForm}>
        <input
          placeholder="Write message"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button>Send</button>
      </form>
    </section>
  );
}
