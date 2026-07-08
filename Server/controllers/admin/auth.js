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

  if (!username || !password) {
    return next(createError.BadRequest('Username and password are required'));
  }

  // Find admin user
  db.query('SELECT * FROM admin_users WHERE username = ?', [username], async (err, results) => {
    if (err) return next(err);

    if (results.length === 0) {
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
        { id: adminUser.id, username: adminUser.username, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          username: adminUser.username,
          role: 'admin'
        }
      });
    } catch (error) {
      next(error);
    }
  });
};