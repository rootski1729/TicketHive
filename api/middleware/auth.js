const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = {
      userId: user._id,
      email: user.email,
      customerId: user.customerId,
      role: user.role
    };
    
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

const requireAdmin = requireRole('Admin');

const ensureTenantIsolation = (req, res, next) => {
  if (req.method === 'GET' || req.method === 'PUT' || req.method === 'DELETE') {
    req.query.customerId = req.user.customerId;
  }
  

  if (req.method === 'POST' && req.body) {
    req.body.customerId = req.user.customerId;
  }
  
  next();
};

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  ensureTenantIsolation
};const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }


    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

 
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }


    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        customerId: user.customerId,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    await AuditLog.logAction({
      action: 'LOGIN',
      userId: user._id,
      customerId: user.customerId,
      resourceType: 'User',
      resourceId: user._id,
      details: {
        email: user.email,
        loginTime: new Date()
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        customerId: user.customerId,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, role = 'User', customerId } = req.body;

    if (!email || !password || !customerId) {
      return res.status(400).json({ 
        error: 'Email, password, and customerId are required' 
      });
    }


    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const user = new User({
      email: email.toLowerCase(),
      password,
      role,
      customerId
    });

    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        customerId: user.customerId
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        customerId: user.customerId,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

router.post('/logout', authenticateToken, async (req, res) => {
  try {

    await AuditLog.logAction({
      action: 'LOGOUT',
      userId: req.user.userId,
      customerId: req.user.customerId,
      resourceType: 'User',
      resourceId: req.user.userId,
      details: {
        logoutTime: new Date()
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }
 // Generate new token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        customerId: user.customerId,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

module.exports = router;