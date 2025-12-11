import { Router } from "express";
import requireLogin from "../middleware/requireLogin.js";
import db from "../database/connection.js";

const router = Router();

//tasks are based upon project.

//Create:
router.post("/", requireLogin, async (req, res) => {
    try {
        const { project_id, title, description, assigned_to, status } = req.body;
        if (!project_id || !title) {
            return res.status(400).json({ error: "Project and title are required" });
        }

        const { lastID } = await db.run(
            `INSERT INTO tasks (project_id, title, description, assigned_to, status)
             VALUES (?, ?, ?, ?, ?)`,
            [project_id, title, description || "", assigned_to || null, status || "todo"]
        );

        const task = await db.get("SELECT * FROM tasks WHERE id = ?", [lastID]);
        res.json({ task });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create task" });
    }
});

//see all task per project:
router.get("/", requireLogin, async (req, res) => {
    try {
        const tasks = await db.all(`
            SELECT t.*, u.username AS assigned_to_name, p.name AS project_name
            FROM tasks t
            LEFT JOIN users u ON t.assigned_to = u.id
            LEFT JOIN projects p ON t.project_id = p.id
        `);
        res.json({ tasks });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch tasks" });
    }
});

//see tasks per staff
router.get("/staff", requireLogin, async (req, res) => {
  try {
    const users = await db.all("SELECT id, username FROM users");

    const staffTasks = await Promise.all(
      users.map(async (u) => {
        const tasks = await db.all(
          `SELECT t.*, p.name AS project_name
           FROM tasks t
           LEFT JOIN projects p ON t.project_id = p.id
           WHERE t.assigned_to = ?`,
           [u.id]
        );
        return { ...u, tasks };
      })
    );

    res.json({ staffTasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch staff tasks" });
  }
});

// 🔹 Read single task
router.get("/:id", requireLogin, async (req, res) => {
    try {
        const task = await db.get(
            `SELECT t.*, u.username AS assigned_to_name, p.name AS project_name
             FROM tasks t
             LEFT JOIN users u ON t.assigned_to = u.id
             LEFT JOIN projects p ON t.project_id = p.id
             WHERE t.id = ?`,
            [req.params.id]
        );
        if (!task) return res.status(404).json({ error: "Task not found" });
        res.json({ task });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch task" });
    }
});

// update task
router.put("/:id", requireLogin, async (req, res) => {
    try {
        const { title, description, assigned_to, status, project_id } = req.body;
        const task = await db.get("SELECT * FROM tasks WHERE id = ?", [req.params.id]);
        if (!task) return res.status(404).json({ error: "Task not found" });

        await db.run(
            `UPDATE tasks
             SET title = ?, description = ?, assigned_to = ?, status = ?, project_id = ?
             WHERE id = ?`,
            [
                title || task.title,
                description || task.description,
                assigned_to ?? task.assigned_to,
                status || task.status,
                project_id || task.project_id,
                req.params.id
            ]
        );

        const updatedTask = await db.get("SELECT * FROM tasks WHERE id = ?", [req.params.id]);
        res.json({ task: updatedTask });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update task" });
    }
});

// 🔹 Delete task
router.delete("/:id", requireLogin, async (req, res) => {
    try {
        const task = await db.get("SELECT * FROM tasks WHERE id = ?", [req.params.id]);
        if (!task) return res.status(404).json({ error: "Task not found" });

        await db.run("DELETE FROM tasks WHERE id = ?", [req.params.id]);
        res.json({ message: "Task deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete task" });
    }
});




export default router;