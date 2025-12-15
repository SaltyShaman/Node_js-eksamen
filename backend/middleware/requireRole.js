export default function requireRole(...allowedRoles) {
    return function (req, res, next) {
        if (!req.session.user) {
            return res.status(401).json({ error: "Du skal være logget ind" });
        }

        const userRole = req.session.user.role;

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ error: "Det må din rolle ikke" });
        }

        next();
    };
}