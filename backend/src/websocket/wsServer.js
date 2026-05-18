import { WebSocketServer } from 'ws';
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Project from "../models/Project.js";
import Message from "../models/Message.js";
import { canAccessProject } from "../utils/permissions.js";

const clients = new Map();

function send(ws, payload) {
  if (ws.readyState === 1) { 
    ws.send(JSON.stringify(payload));
  }
}

function broadcastToProject(projectId, payload) {
  for (const [, client] of clients) {
    if (String(client.projectId) === String(projectId)) {
      send(client.ws, payload);
    }
  }
}

function getOnlineUsers(projectId) {
  const users = [];
  for (const [, client] of clients) {
    if (String(client.projectId) === String(projectId)) {
      users.push(client.user);
    }
  }
  const map = new Map();
  users.forEach((user) => map.set(String(user.id), user));
  return [...map.values()];
}

export function notifyProjectUpdate(projectId, type, extraData = {}) {
  broadcastToProject(projectId, {
    type,
    projectId,
    ...extraData
  });
}

export function setupWebSocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", async (ws, req) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const token = url.searchParams.get("token");
      const projectId = url.searchParams.get("projectId");

      if (!token || !projectId) {
        ws.close();
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      const project = await Project.findById(projectId);

      if (!user || !project || !canAccessProject(user._id, project)) {
        ws.close();
        return;
      }

      const clientId = `${user._id}-${Date.now()}`;

      clients.set(clientId, {
        ws,
        projectId,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl
        }
      });

      broadcastToProject(projectId, {
        type: "online-users",
        users: getOnlineUsers(projectId)
      });

      ws.on("message", async (raw) => {
        try {
          const data = JSON.parse(raw.toString());

          if (data.type === "chat-message") {
            const message = await Message.create({
              project: projectId,
              sender: user._id,
              text: data.text,
              attachmentUrl: data.attachmentUrl || "",
              readBy: [user._id]
            });

            const populated = await Message.findById(message._id).populate(
              "sender",
              "name email avatarUrl"
            );

            broadcastToProject(projectId, {
              type: "chat-message",
              message: populated
            });
          }

          if (data.type === "typing") {
            broadcastToProject(projectId, {
              type: "typing",
              user: {
                id: user._id,
                name: user.name
              }
            });
          }
        } catch {
          send(ws, { type: "error", message: "Invalid message" });
        }
      });

      ws.on("close", () => {
        clients.delete(clientId);
        broadcastToProject(projectId, {
          type: "online-users",
          users: getOnlineUsers(projectId)
        });
      });
    } catch {
      ws.close();
    }
  });
}