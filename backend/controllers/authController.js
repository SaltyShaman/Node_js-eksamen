import db from "../database/connection.js";
import bcrypt from "bcrypt";

export async function login(req, res) {
    const { username, password } = req.body;

    const user = await db.get(
        "SELECT * FROM users WHERE username = ?",
        [username]
    );

    if (!user) return res.status(401).json({ error: "Ugyldig bruger" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Ugyldigt login" });

    req.session.user = { id: user.id, username: user.username, role: user.role };

    res.json({ message: "Logged in", user: req.session.user });
}

// LOGOUT
export function logout(req, res) {

    if (!req.session.user) {
        return res.status(401).json({error: "Du er ikke logget ind"})
    }


    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: "Kunne ikke logge ud" });
        res.json({ message: "Logged ud" });
    });
}



