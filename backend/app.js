import "dotenv/config";
import express from "express";
const app = express();


// Config
import sessionConfig from "./config/sessionConfig.js";
import { generalLimiter, authLimiter } from "./config/rateLimiters.js";


//Middleware imports
import helmet from "helmet";

app.use(express.json());

import cors from 'cors';

//CORS has to be before the routers
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));


// Middleware app use
app.use(sessionConfig);
app.use(helmet());
app.use(generalLimiter);


// Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));