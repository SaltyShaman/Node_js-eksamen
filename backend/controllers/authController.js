import db from "../database/connection.js";
import bcrypt from "bcrypt";

// LOGIN
export async function login(req, res) {
    const { usernameOrEmail, password } = req.body;

    // Find user by username OR email
    const user = await db.get(
        "SELECT * FROM users WHERE username = ? OR email = ?",
        [usernameOrEmail, usernameOrEmail]
    );

    if (!user) return res.status(401).json({ error: "Invalid username/email or password" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid username/email or password" });

    // Save session
    req.session.user = { id: user.id, username: user.username, role: user.role };

    res.json({ message: "Logged in", user: req.session.user });
}

// LOGOUT
export function logout(req, res) {
    req.session.destroy(() => {
        res.json({ message: "Logged out" });
    });
}



