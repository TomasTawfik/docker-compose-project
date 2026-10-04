const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authorization = req.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      message: "Authentication is not configured",
    });
  }

  try {
    const payload = jwt.verify(match[1], process.env.JWT_SECRET);
    const userId = Number(payload.sub);

    if (!Number.isInteger(userId)) {
      throw new Error("Invalid token subject");
    }

    req.user = {
      id: userId,
      email: payload.email,
    };

    return next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}

module.exports = authMiddleware;