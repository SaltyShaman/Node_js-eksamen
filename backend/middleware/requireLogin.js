export default function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ error: "Du er ikke logget ind" });
    }
    next();
}