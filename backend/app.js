import "dotenv/config";
import express from "express";
const app = express();


// Config
import sessionConfig from "./config/sessionConfig.js";

//Middleware imports
import helmet from "helmet";

app.use(express.json());

// Middleware app use
app.use(sessionConfig);
app.use(helmet());


// Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));