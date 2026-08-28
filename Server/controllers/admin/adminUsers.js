const db = require("../../config/db");
const createError = require("http-errors");
const bcrypt = require('bcrypt');

exports.getAdminUsers = (req, res, next) => {
  db.query('SELECT id, username, email, google_id, avatar_url, created_at FROM admin_users ORDER BY id DESC', (err, results) => {
    if (err) return next(err);
    res.status(200).json(results);
  });
};

exports.createAdminUser = async (req, res, next) => {
  const { username, password, email } = req.body;
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
    const safeEmail = email && email.trim() ? email.trim().toLowerCase() : null;
    db.query('SELECT id FROM admin_users WHERE username = ? OR (email IS NOT NULL AND email = ?)', [username.trim(), safeEmail], async (err, results) => {
      if (err) return next(err);
      if (results.length > 0) {
        return next(createError.Conflict('Username or Email is already associated with an admin account'));
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 10);

      // Insert
      db.query('INSERT INTO admin_users (username, password_hash, email) VALUES (?, ?, ?)', [username.trim(), password_hash, safeEmail], (err, insertResult) => {
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

exports.updateUserPassword = async (req, res, next) => {
  const { id } = req.params;
  const { newPassword, currentPassword } = req.body;
  const currentAdminId = req.adminUser.id;

  if (!newPassword || newPassword.length < 6) {
    return next(createError.BadRequest('New password must be at least 6 characters long'));
  }

  try {
    if (parseInt(id) === parseInt(currentAdminId) && currentPassword) {
      db.query('SELECT password_hash FROM admin_users WHERE id = ?', [id], async (err, results) => {
        if (err) return next(err);
        if (results.length === 0) return next(createError.NotFound('Admin user not found'));

        const isMatch = await bcrypt.compare(currentPassword, results[0].password_hash);
        if (!isMatch) {
          return next(createError.Unauthorized('Incorrect current password'));
        }

        const new_password_hash = await bcrypt.hash(newPassword, 10);
        db.query('UPDATE admin_users SET password_hash = ? WHERE id = ?', [new_password_hash, id], (updateErr) => {
          if (updateErr) return next(updateErr);
          return res.status(200).json({ success: true, message: 'Password updated successfully' });
        });
      });
    } else {
      const new_password_hash = await bcrypt.hash(newPassword, 10);
      db.query('UPDATE admin_users SET password_hash = ? WHERE id = ?', [new_password_hash, id], (err, result) => {
        if (err) return next(err);
        if (result.affectedRows === 0) {
          return next(createError.NotFound('Admin user not found'));
        }
        res.status(200).json({ success: true, message: 'Password updated successfully' });
      });
    }
  } catch (error) {
    next(error);
  }
};
