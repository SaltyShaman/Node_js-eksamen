import { Router } from "express";
import requireLogin from "../middleware/requireLogin.js";
import db from "../database/connection.js";

const router = Router();

//first: see all projects and associated tasks

router.get("/projects", requireLogin, async (req, res) => {
    try {
        // see all projects
        const projects = await db.all("SELECT * FROM projects");

        // tasks per project
        for (let project of projects) {
            const tasks = await db.all(
                "SELECT t.id, t.title, t.description, t.status, u.username AS assigned_to FROM tasks t LEFT JOIN users u ON t.assigned_to = u.id WHERE project_id = ?",
                [project.id]
            );
            project.tasks = tasks;
        }

        res.json({ projects });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch projects" });
    }
});

export default router;