import express from 'express';
import bcrypt from 'bcrypt';
import User from './user.model.js';
import { authenticate, requireAdmin } from '../auth/auth.routes.js';

const router = express.Router();

// Get all users (Admin only)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new user (Admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const assignedRole = ['admin', 'manager', 'viewer'].includes(role) ? role : 'viewer';
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: assignedRole
    });

    const userObj = newUser.toObject();
    delete userObj.password;

    res.status(201).json(userObj);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user role (Admin only)
router.put('/:id/role', authenticate, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'manager', 'viewer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    // Safety: prevent demoting the last admin
    if (targetUser.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot demote the only administrator in the system' });
      }
    }

    targetUser.role = role;
    await targetUser.save();
    
    const userObj = targetUser.toObject();
    delete userObj.password;
    res.json(userObj);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete user (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own active administrator account' });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    if (targetUser.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the only administrator in the system' });
      }
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
