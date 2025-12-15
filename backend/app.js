import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";

import sessionConfig from "./config/sessionConfig.js";
import { generalLimiter } from "./config/rateLimiters.js";

import protectedRouter from "./routers/protectedRouter.js";
import authRouter from "./routers/authRouter.js";
import projectRouter from "./routers/projectRouter.js";
import taskRouter from "./routers/taskRouter.js";
import userRouter from "./routers/userRouter.js";

import socketHandler from "./sockets/socketHandler.js";
import { setIo } from "./sockets/socketIoInstance.js";

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(sessionConfig); 
app.use(helmet());
app.use(generalLimiter);
app.use(protectedRouter);
app.use("/auth", authRouter);
app.use("/api/projects", projectRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/users", userRouter);

// --- Socket.IO with session ---
const io = new Server(server, {
  cors: { origin: 'http://localhost:5173', credentials: true }
});

//make the session avaible
io.use((socket, next) => {
  sessionConfig(socket.request, {}, next);
});

socketHandler(io);
setIo(io);

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
