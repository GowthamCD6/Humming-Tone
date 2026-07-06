const db = require("../../config/db");
const createError = require("http-errors");
const bcrypt = require('bcrypt');

exports.getAdminUsers = (req, res, next) => {
  db.query('SELECT id, username, created_at FROM admin_users ORDER BY id DESC', (err, results) => {
    if (err) return next(err);
    res.status(200).json(results);
  });
};

exports.createAdminUser = async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return next(createError.BadRequest('Username and password are required'));
  }

  // Basic validation
  if (username.trim().length < 3) {
    return next(createError.BadRequest('Username must be at least 3 characters long'));
  }
  if (password.length < 6) {
    return next(createError.BadRequest('Password must be at least 6 characters long'));
  }

  try {
    // Check if user already exists
    db.query('SELECT id FROM admin_users WHERE username = ?', [username], async (err, results) => {
      if (err) return next(err);
      if (results.length > 0) {
        return next(createError.Conflict('Username is already taken'));
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 10);

      // Insert
      db.query('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)', [username, password_hash], (err, insertResult) => {
        if (err) return next(err);
        res.status(201).json({
          message: 'Admin user created successfully',
          userId: insertResult.insertId
        });
      });
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteAdminUser = (req, res, next) => {
  const { id } = req.params;
  const currentAdminId = req.adminUser.id;

  if (parseInt(id) === parseInt(currentAdminId)) {
    return next(createError.BadRequest('You cannot delete your own admin account'));
  }

  db.query('DELETE FROM admin_users WHERE id = ?', [id], (err, result) => {
    if (err) return next(err);
    if (result.affectedRows === 0) {
      return next(createError.NotFound('Admin user not found'));
    }
    res.status(200).json({ message: 'Admin user deleted successfully' });
  });
};

exports.changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const adminId = req.adminUser.id;

  if (!currentPassword || !newPassword) {
    return next(createError.BadRequest('Current password and new password are required'));
  }

  if (newPassword.length < 6) {
    return next(createError.BadRequest('New password must be at least 6 characters long'));
  }

  try {
    // Fetch user's current password hash
    db.query('SELECT password_hash FROM admin_users WHERE id = ?', [adminId], async (err, results) => {
      if (err) return next(err);
      if (results.length === 0) {
        return next(createError.NotFound('Admin user not found'));
      }

      const adminUser = results[0];
      const isMatch = await bcrypt.compare(currentPassword, adminUser.password_hash);
      if (!isMatch) {
        return next(createError.Unauthorized('Incorrect current password'));
      }

      const new_password_hash = await bcrypt.hash(newPassword, 10);
      db.query('UPDATE admin_users SET password_hash = ? WHERE id = ?', [new_password_hash, adminId], (err, updateResult) => {
        if (err) return next(err);
        res.status(200).json({ message: 'Password changed successfully' });
      });
    });
  } catch (error) {
    next(error);
  }
};
