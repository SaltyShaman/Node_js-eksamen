import db from "../database/connection.js";
import bcrypt from "bcrypt";

export async function login(req, res) {
    const { username, password } = req.body; // <--- brug username i stedet for usernameOrEmail

    const user = await db.get(
        "SELECT * FROM users WHERE username = ?",
        [username]
    );

    if (!user) return res.status(401).json({ error: "Invalid username or password" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid username or password" });

    req.session.user = { id: user.id, username: user.username, role: user.role };

    res.json({ message: "Logged in", user: req.session.user });
}

// LOGOUT
export function logout(req, res) {
    req.session.destroy(() => {
        res.json({ message: "Logged out" });
    });
}



