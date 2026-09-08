const db = require("../../config/db");
const createError = require("http-errors");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set.');
}

exports.adminLogin = (req, res, next) => {
  const { username, password } = req.body;

  const identifier = (username || '').trim();

  if (!identifier || !password) {
    return next(createError.BadRequest('Username and password are required'));
  }

  // Find admin user by username or email (case-insensitive)
  db.query(
    'SELECT * FROM admin_users WHERE LOWER(username) = LOWER(?) OR (email IS NOT NULL AND LOWER(email) = LOWER(?)) LIMIT 1',
    [identifier, identifier],
    async (err, results) => {
      if (err) {
        console.error('Admin login database error:', err);
        return next(createError.InternalServerError('Database connection error. Please try again in a moment.'));
      }

      if (!results || results.length === 0) {
        return next(createError.Unauthorized('Invalid username or password'));
      }

      const adminUser = results[0];

      try {
        // Compare passwords
        const isMatch = await bcrypt.compare(password, adminUser.password_hash);
        
        if (!isMatch) {
          return next(createError.Unauthorized('Invalid username or password'));
        }

        // Generate JWT token
        const token = jwt.sign(
          { id: adminUser.id, username: adminUser.username, email: adminUser.email, role: 'admin' },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.status(200).json({
          message: 'Login successful',
          token,
          user: {
            id: adminUser.id,
            username: adminUser.username,
            email: adminUser.email,
            avatar_url: adminUser.avatar_url,
            role: 'admin'
          }
        });
      } catch (error) {
        next(error);
      }
    }
  );
};