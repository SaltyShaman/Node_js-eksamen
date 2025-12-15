import { Router } from "express";
import requireLogin from "../middleware/requireLogin.js";
import db from "../database/connection.js";
import { getIo } from "../sockets/socketIoInstance.js";
import requireRole from "../middleware/requireRole.js";


const router = Router();

// 🔹 Get all users
router.get("/", requireLogin, requireRole("ADMIN", "TEAM_LEADER"), async (req, res) => {
  try {
    const users = await db.all("SELECT id, username, email, role, created_at FROM users");
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// 🔹 Get single user by ID
router.get("/:id", requireLogin, requireRole("ADMIN", "TEAM_LEADER"), async (req, res) => {
  try {
    const user = await db.get(
      "SELECT id, username, email, role, created_at FROM users WHERE id = ?",
      [req.params.id]
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// 🔹 Check if username exists
router.get("/exists/:username", requireLogin, requireRole("ADMIN", "TEAM_LEADER"), async (req, res) => {
  try {
    const user = await db.get("SELECT id FROM users WHERE username = ?", [req.params.username]);
    res.json({ exists: !!user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to check user" });
  }
});

// 🔹 Create new user
router.post("/", requireLogin, requireRole("ADMIN"), async (req, res) => {
  try {
    const { username, email, role, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email og password er påkrævet" });
    }

    // Hash password
    const bcrypt = await import("bcrypt");
    const password_hash = await bcrypt.hash(password, 10);

    const { lastID } = await db.run(
      "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [username, email, password_hash, role || "STAFF"]
    );

    const user = await db.get(
      "SELECT id, username, email, role, created_at FROM users WHERE id = ?",
      [lastID]
    );

    const io = getIo();
    io.emit("userCreated", user);

    res.json({ user });
  } catch (err) {
      if (err.message.includes("UNIQUE")) {
      return res.status(409).json({ error: "Bruger findes allerede" });
  }

  console.error(err);
  res.status(500).json({ error: "Kunne ikke oprette bruger" });
}
});

// 🔹 Update existing user
router.put("/:id", requireLogin, requireRole("ADMIN"), async (req, res) => {
  try {
    const { username, email, role, password } = req.body;

    const user = await db.get("SELECT * FROM users WHERE id = ?", [req.params.id]);
    if (!user) return res.status(404).json({ error: "User not found" });

    let password_hash = user.password_hash;
    if (password) {
      const bcrypt = await import("bcrypt");
      password_hash = await bcrypt.hash(password, 10);
    }

    await db.run(
      `UPDATE users
       SET username = ?, email = ?, role = ?, password_hash = ?
       WHERE id = ?`,
      [
        username || user.username,
        email || user.email,
        role || user.role,
        password_hash,
        req.params.id
      ]
    );

    const updatedUser = await db.get(
      "SELECT id, username, email, role, created_at FROM users WHERE id = ?",
      [req.params.id]
    );

    const io = getIo();
    io.emit("userUpdated", updatedUser);

    res.json({ user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

router.delete("/:id", requireLogin,  requireRole("ADMIN"), async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await db.get("SELECT * FROM users WHERE id = ?", [userId]);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 🔹 1. Detach tasks 
    await db.run(
      "UPDATE tasks SET assigned_to = NULL WHERE assigned_to = ?",
      [userId]
    );

    // 🔹 2. Delete user
    await db.run("DELETE FROM users WHERE id = ?", [userId]);

    // 🔹 3. Sockets
    const io = getIo();

    io.emit("userDeleted", { id: userId });

    io.emit("tasksDetachedFromUser", {
      userId,
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});



export default router;
