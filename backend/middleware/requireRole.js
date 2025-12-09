export default function requireRole(...allowedRoles) {
    return function (req, res, next) {
        if (!req.session.user) {
            return res.status(401).json({ error: "Not logged in" });
        }

        const userRole = req.session.user.role;

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ error: "Forbidden: insufficient role" });
        }

        next();
    };
}