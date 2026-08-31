const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const db = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET;

const userAuth = (req, res, next) => {
  try {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(createError.Unauthorized("Authentication required. Please sign in."));
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || (!decoded.id && !decoded.userId)) {
      return next(createError.Unauthorized("Invalid authentication token"));
    }

    const userId = decoded.id || decoded.userId;
    db.query(
      "SELECT id, name, email, phone FROM users WHERE id = ? LIMIT 1",
      [userId],
      (error, result) => {
        if (error) return next(createError.InternalServerError(error.message));
        if (!result || result.length === 0) {
          return next(createError.Unauthorized("User account not found"));
        }
        req.user = result[0];
        req.userId = result[0].id;
        req.userEmail = result[0].email;
        next();
      }
    );
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return next(createError.Unauthorized("Invalid or expired session. Please sign in with Google."));
    }
    next(error);
  }
};

module.exports = userAuth;