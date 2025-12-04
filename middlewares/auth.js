const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

exports.isUser = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
console.log("token:", token);
    if (!token) {
        return res
            .status(401)
            .json({ message: "Access Denied. No token provided." });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log("decod:", decoded);
        
        req.user = decoded;
        next();
    } catch (error) {
        return res
            .status(403)
            .json({ succes: false, message: "Invalid or expired token!" });
    }
};

exports.isAdmin = (req, res, next) => {
    if (req.user?.role === "ADMIN") {
        next();
        return;
    }
    return res.status(403).json({
        success: false,
        message: "Only admins can access this route",
    });
};

exports.isSameUser = (req, res, next) => {
    const { uuid } = req.params;
    if (req.user?.uuid !== uuid) {
        return res.status(403).json({ success: false, message: "Wrong profile, is this your profile!" });
    }
    return next();
};
