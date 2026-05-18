"use client";

import { createContext, useContext, useRef, useState } from "react";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [wsInstance, setWsInstance] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState([]);

  function connect(projectId) {
    const token = localStorage.getItem("token");

    if (!token || socketRef.current) return;

    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}?token=${token}&projectId=${projectId}`
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "online-users") {
        setOnlineUsers(data.users);
      }

      if (data.type === "chat-message") {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    socketRef.current = ws;
    setWsInstance(ws);
  }

  function disconnect() {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
      setWsInstance(null);
      setOnlineUsers([]);
      setMessages([]);
    }
  }

  function sendMessage(text, attachmentUrl = "") {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

    socketRef.current.send(
      JSON.stringify({
        type: "chat-message",
        text,
        attachmentUrl
      })
    );
  }

  return (
    <SocketContext.Provider
      value={{
        socket: wsInstance,
        onlineUsers,
        messages,
        setMessages,
        connect,
        disconnect,
        sendMessage
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}