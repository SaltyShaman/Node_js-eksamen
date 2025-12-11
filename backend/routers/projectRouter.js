import { Router } from "express";
import requireLogin from "../middleware/requireLogin.js";
import db from "../database/connection.js";

const router = Router();

//first: see all projects and associated tasks

router.get("/", requireLogin, async (req, res) => {
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

router.get("/search", requireLogin, async (req, res) => {
    const query = req.query.query || "";

    try {
        // Find projekter baseret på projekt- eller task-navn
        const projects = await db.all(
            `
            SELECT DISTINCT p.*
            FROM projects p
            LEFT JOIN tasks t ON t.project_id = p.id
            WHERE p.name LIKE ? OR t.title LIKE ?
            `,
            [`%${query}%`, `%${query}%`]
        );

        // Hent tasks for hvert fundet projekt
        for (let project of projects) {
            const tasks = await db.all(
                `
                SELECT t.id, t.title, t.description, t.status, u.username AS assigned_to
                FROM tasks t
                LEFT JOIN users u ON t.assigned_to = u.id
                WHERE t.project_id = ?
                `,
                [project.id]
            );
            project.tasks = tasks;
        }

        res.json({ projects });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Fejl ved søgning" });
    }
});

//find single project by id
router.get("/:id", requireLogin, async (req, res) => {
  try {
    const project = await db.get("SELECT * FROM projects WHERE id = ?", [req.params.id]);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const tasks = await db.all(
      `SELECT t.id, t.title, t.description, t.status, u.username AS assigned_to
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE project_id = ?`,
      [project.id]
    );

    project.tasks = tasks;
    res.json({ project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

//create project - remember projects are created without tasks
router.post("/", requireLogin, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: "Project name is required" });

    const { lastID } = await db.run(
      "INSERT INTO projects (name, description, created_by) VALUES (?, ?, ?)",
      [name, description || "", req.session.user.id]
    );

    const project = await db.get("SELECT * FROM projects WHERE id = ?", [lastID]);
    res.json({ project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create project" });
  }
});
        
    // 🔹 UPDATE project
router.put("/:id", requireLogin, async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await db.get("SELECT * FROM projects WHERE id = ?", [req.params.id]);
    if (!project) return res.status(404).json({ error: "Project not found" });

    await db.run(
      "UPDATE projects SET name = ?, description = ? WHERE id = ?",
      [name || project.name, description || project.description, req.params.id]
    );

    const updatedProject = await db.get("SELECT * FROM projects WHERE id = ?", [req.params.id]);
    res.json({ project: updatedProject });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update project" });
  }
});

// 🔹 DELETE project
router.delete("/:id", requireLogin, async (req, res) => {
  try {
    const project = await db.get("SELECT * FROM projects WHERE id = ?", [req.params.id]);
    if (!project) return res.status(404).json({ error: "Project not found" });

    await db.run("DELETE FROM projects WHERE id = ?", [req.params.id]);
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete project" });
  }
});


export default router;