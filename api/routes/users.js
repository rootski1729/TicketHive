const express = require('express');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all users for the current tenant (Admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const users = await User.find({ customerId: req.user.customerId })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID (Admin only or self)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      customerId: req.user.customerId
    }).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Allow access if user is admin or viewing their own profile
    if (req.user.role !== 'Admin' && req.user.userId !== req.params.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create new user (Admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { email, password, role = 'User' } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      customerId: req.user.customerId
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const user = new User({
      email: email.toLowerCase(),
      password,
      role,
      customerId: req.user.customerId
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
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user (Admin only or self for limited fields)
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      customerId: req.user.customerId
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check permissions
    const isAdmin = req.user.role === 'Admin';
    const isSelf = req.user.userId === req.params.id;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Define allowed fields based on role
    const allowedFields = isSelf && !isAdmin 
      ? ['password'] // Regular users can only change their password
      : ['email', 'password', 'role', 'isActive']; // Admins can change everything

    let hasChanges = false;
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
        hasChanges = true;
      }
    });

    if (!hasChanges) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    await user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        customerId: user.customerId,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (Admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      customerId: req.user.customerId
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent self-deletion
    if (req.user.userId === req.params.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(user._id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get audit logs for the tenant (Admin only)
router.get('/audit/logs', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, userId, action } = req.query;
    
    const filter = { customerId: req.user.customerId };
    if (userId) filter.userId = userId;
    if (action) filter.action = action;

    const logs = await AuditLog.find(filter)
      .populate('userId', 'email')
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AuditLog.countDocuments(filter);

    res.json({
      logs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

module.exports = router;