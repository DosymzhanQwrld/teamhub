import path from "path";
import dotenv from "dotenv";
// Находим .env относительно текущего файла app.js
dotenv.config({ path: path.resolve(process.cwd(), ".env") }); 

import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import messageRoutes from "./routes/message.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import fileInfoRouter from "./routes/file-info.routes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true
  })
);

// Монтируем роут uploadthing строго до JSON парсеров
app.use("/api/uploadthing", uploadRoutes);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.get("/", (req, res) => {
  res.json({ message: "TeamHub API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/file-info", fileInfoRouter);

export default app;