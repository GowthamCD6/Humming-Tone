const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const db = require("../../config/db");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Customer / Storefront Google Login & Auto-Registration
 * POST /api/auth/google/user
 */
exports.googleUserAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return next(createError.BadRequest("Google credential token is required"));
    }

    // 1. Verify Google ID Token (support Web and Android clients)
    const allowedAudiences = [
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_ANDROID_CLIENT_ID,
    ].filter(Boolean);

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: allowedAudiences,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return next(createError.Unauthorized("Invalid Google token"));
    }

    const { sub: google_id, email, name, picture } = payload;
    const normalizedEmail = email.toLowerCase().trim();

    // 2. Check if user already exists by email or google_id
    const [existingUsers] = await db.promise().query(
      "SELECT * FROM users WHERE email = ? OR google_id = ? LIMIT 1",
      [normalizedEmail, google_id]
    );

    let user;

    if (existingUsers.length > 0) {
      user = existingUsers[0];
      // Update google_id / avatar / name if needed
      await db.promise().query(
        "UPDATE users SET google_id = COALESCE(google_id, ?), avatar_url = COALESCE(?, avatar_url), name = COALESCE(name, ?) WHERE id = ?",
        [google_id, picture, name, user.id]
      );
      user.avatar_url = picture || user.avatar_url;
      user.name = name || user.name;
    } else {
      // 3. Create new customer user
      const [insertResult] = await db.promise().query(
        "INSERT INTO users (name, email, google_id, avatar_url) VALUES (?, ?, ?, ?)",
        [name || "Google User", normalizedEmail, google_id, picture || null]
      );
      user = {
        id: insertResult.insertId,
        name: name || "Google User",
        email: normalizedEmail,
        google_id,
        avatar_url: picture || null,
      };
    }

    // 4. Generate customer user token WITHOUT expiration (so customer login never expires)
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: "user" },
      JWT_SECRET
      // No expiresIn provided -> token never expires for storefront buyers
    );

    return res.status(200).json({
      message: "Google sign-in successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
      },
    });
  } catch (error) {
    console.error("Google user auth error:", error);
    return next(createError.Unauthorized(error.message || "Failed to authenticate with Google"));
  }
};

/**
 * Admin Portal Google Login
 * POST /api/auth/google/admin
 */
exports.googleAdminAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return next(createError.BadRequest("Google credential token is required"));
    }

    // 1. Verify Google ID Token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return next(createError.Unauthorized("Invalid Google token"));
    }

    const { sub: google_id, email, name, picture } = payload;
    const normalizedEmail = email.toLowerCase().trim();

    // 2. Check if admin exists in admin_users by email or google_id
    const [adminRows] = await db.promise().query(
      "SELECT * FROM admin_users WHERE email = ? OR google_id = ? OR username = ? LIMIT 1",
      [normalizedEmail, google_id, normalizedEmail]
    );

    if (adminRows.length === 0) {
      return next(
        createError.Forbidden(
          `Google account (${normalizedEmail}) is not authorized as an administrator. Please contact the store owner.`
        )
      );
    }

    const adminUser = adminRows[0];

    // Update google_id and email if not linked yet
    await db.promise().query(
      "UPDATE admin_users SET google_id = COALESCE(google_id, ?), email = COALESCE(email, ?), avatar_url = COALESCE(avatar_url, ?) WHERE id = ?",
      [google_id, normalizedEmail, picture, adminUser.id]
    );

    // 3. Issue Admin JWT Token
    const token = jwt.sign(
      { id: adminUser.id, username: adminUser.username, role: "admin" },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      message: "Admin login successful",
      token,
      user: {
        id: adminUser.id,
        username: adminUser.username,
        email: normalizedEmail,
        avatar_url: picture,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Google admin auth error:", error);
    return next(createError.Unauthorized(error.message || "Failed to authenticate with Google"));
  }
};
