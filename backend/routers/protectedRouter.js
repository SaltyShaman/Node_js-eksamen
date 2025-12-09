import { Router } from "express";
import requireLogin from "../middleware/requireLogin.js";
import requireRole from "../middleware/requireRole.js";

const router = Router();

router.get("/protected", requireLogin, (req, res) => {
    res.json({
        message: "Welcome to the protected route",
        user: req.session.user
    });
});

router.get("/admin-only", requireRole("ADMIN"), (req, res) => {
    res.json({ message: "Welcome admin" });
});

router.get("/leader-or-admin", requireRole("TEAM_LEADER", "ADMIN"), (req, res) => {
    res.json({ message: "Leader or admin allowed" });
});

router.get("/staff-area", requireRole("STAFF", "TEAM_LEADER", "ADMIN"), (req, res) => {
    res.json({ message: "Staff or above allowed" });
});


export default router;