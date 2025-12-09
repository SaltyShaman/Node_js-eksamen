import { Router } from "express";
import requireLogin from "../middleware/requireLogin.js";

const router = Router();

router.get("/protected", requireLogin, (req, res) => {
    res.json({
        message: "Welcome to the protected route",
        user: req.session.user
    });
});

export default router;