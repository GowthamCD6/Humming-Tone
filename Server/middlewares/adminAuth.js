const jwt = require('jsonwebtoken');
const createError = require('http-errors');

const JWT_SECRET = process.env.JWT_SECRET || 'hummingtone_admin_secret_key_2026';

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError.Unauthorized('Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw createError.Unauthorized('Authentication token is missing');
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.role !== 'admin') {
      throw createError.Forbidden('Access denied. Admin privileges required.');
    }

    // Attach admin user data to request object
    req.adminUser = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(createError.Unauthorized('Invalid or expired token'));
    } else {
      next(error);
    }
  }
};
