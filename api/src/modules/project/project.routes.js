import express from 'express';
import Project from './project.model.js';
import { authenticate } from '../auth/auth.routes.js';

const router = express.Router();

// Get all projects the user can access
router.get('/', authenticate, async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'admin') {
      projects = await Project.find().populate('ownerId', 'name email');
    } else {
      projects = await Project.find({
        $or: [
          { ownerId: req.user.id },
          { members: req.user.id }
        ]
      }).populate('ownerId', 'name email');
    }
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new project (Manager or Admin)
router.post('/', authenticate, async (req, res) => {
  if (req.user.role === 'viewer') return res.status(403).json({ message: 'Forbidden' });

  try {
    const project = await Project.create({
      ...req.body,
      ownerId: req.user.id,
      members: [req.user.id] // Owner is also a member
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific project by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('ownerId', 'name email').populate('members', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    // Authorization check
    if (req.user.role !== 'admin' && project.ownerId._id.toString() !== req.user.id && !project.members.some(m => m._id.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
