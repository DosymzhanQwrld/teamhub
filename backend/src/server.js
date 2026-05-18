import "dotenv/config";
import http from "http";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { setupWebSocket } from "./websocket/wsServer.js";

const PORT = process.env.PORT || 5000;

await connectDB();

const server = http.createServer(app);

setupWebSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});