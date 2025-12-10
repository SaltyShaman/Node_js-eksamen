import "dotenv/config";
import express from "express";
const app = express();


// Config
import sessionConfig from "./config/sessionConfig.js";
import { generalLimiter, authLimiter } from "./config/rateLimiters.js";

//Sockets
import { Server } from "socket.io";
import http from "http";
import socketHandler from "./sockets/socketHandler.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: 'http://localhost:5173', credentials: true }
});

socketHandler(io);

//Middleware imports
import helmet from "helmet";
import protectedRouter from "./routers/protectedRouter.js";


app.use(express.json());

import cors from 'cors';

//CORS has to be before the routers
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// Routers imports
import authRouter from "./routers/authRouter.js";
import projectRouter from "./routers/projectRouter.js"
import taskRouter from "./routers/taskRouter.js";

// Middleware app use
app.use(sessionConfig);
app.use(helmet());
app.use(generalLimiter);
app.use(protectedRouter);
app.use("/auth", authRouter);

//Endpoint uses
app.use("/api/projects", projectRouter);
app.use("/api/tasks", taskRouter);

// Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));