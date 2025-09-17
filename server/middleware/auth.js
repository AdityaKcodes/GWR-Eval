// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Verify token
const auth = async (req, res, next) => {
  try {
    console.log('🔐 Auth middleware called for:', req.method, req.url);
    console.log('📨 Headers received:', {
      authorization: req.headers.authorization ? 'Present' : 'Missing',
      'content-type': req.headers['content-type'],
      origin: req.headers.origin
    });

    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ No token provided in Authorization header');
      return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
    }

    console.log('✅ Token found:', token.substring(0, 20) + '...');

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token decoded successfully. User ID:', decoded.userId);

    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log('❌ User not found in database');
      return res.status(401).json({ success: false, error: 'Token is not valid.' });
    }

    if (!user.isActive) {
      console.log('❌ User account is not active');
      return res.status(401).json({ success: false, error: 'Token is not valid.' });
    }

    console.log('✅ User authenticated successfully:', user.username, `(${user.role})`);
    req.user = user;
    next();
    
  } catch (error) {
    console.log('❌ Token verification failed:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, error: 'Invalid token format.' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token has expired.' });
    }
    
    res.status(401).json({ success: false, error: 'Token is not valid.' });
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('👮 Role check required:', roles);
    console.log('👤 User role:', req.user.role);
    
    if (!roles.includes(req.user.role)) {
      console.log('❌ Access denied. User role not permitted');
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied. Insufficient permissions.' 
      });
    }
    
    console.log('✅ Role check passed');
    next();
  };
};

module.exports = { auth, authorize };