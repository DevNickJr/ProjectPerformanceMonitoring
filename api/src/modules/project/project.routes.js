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

// Update project (Manager or Admin)
router.put('/:id', authenticate, async (req, res) => {
  if (req.user.role === 'viewer') return res.status(403).json({ message: 'Forbidden' });

  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (req.user.role !== 'admin' && project.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate('ownerId', 'name email').populate('members', 'name email');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add a task to project
router.post('/:id/tasks', authenticate, async (req, res) => {
  if (req.user.role === 'viewer') return res.status(403).json({ message: 'Forbidden' });

  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const newTask = {
      title: req.body.title,
      description: req.body.description || '',
      assignedTo: req.body.assignedTo || '',
      dueDate: req.body.dueDate || null,
      status: req.body.status || 'Pending',
      completionPercentage: Number(req.body.completionPercentage) || 0,
      createdAt: new Date()
    };

    project.tasks.push(newTask);

    // Recalculate overall completion percentage
    if (project.tasks.length > 0) {
      const sum = project.tasks.reduce((acc, t) => acc + (t.completionPercentage || 0), 0);
      project.taskCompletionPercentage = Math.round(sum / project.tasks.length);
    }

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a task
router.put('/:id/tasks/:taskId', authenticate, async (req, res) => {
  if (req.user.role === 'viewer') return res.status(403).json({ message: 'Forbidden' });

  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const task = project.tasks.id(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.body.title !== undefined) task.title = req.body.title;
    if (req.body.description !== undefined) task.description = req.body.description;
    if (req.body.assignedTo !== undefined) task.assignedTo = req.body.assignedTo;
    if (req.body.dueDate !== undefined) task.dueDate = req.body.dueDate;
    if (req.body.completionPercentage !== undefined) {
      task.completionPercentage = Math.min(100, Math.max(0, Number(req.body.completionPercentage)));
      if (task.completionPercentage === 100) task.status = 'Completed';
      else if (task.completionPercentage > 0) task.status = 'In Progress';
      else task.status = 'Pending';
    }
    if (req.body.status !== undefined) {
      task.status = req.body.status;
      if (task.status === 'Completed' && task.completionPercentage < 100) {
        task.completionPercentage = 100;
      } else if (task.status === 'Pending') {
        task.completionPercentage = 0;
      }
    }

    // Recalculate overall completion percentage
    if (project.tasks.length > 0) {
      const sum = project.tasks.reduce((acc, t) => acc + (t.completionPercentage || 0), 0);
      project.taskCompletionPercentage = Math.round(sum / project.tasks.length);
    }

    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a task
router.delete('/:id/tasks/:taskId', authenticate, async (req, res) => {
  if (req.user.role === 'viewer') return res.status(403).json({ message: 'Forbidden' });

  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    project.tasks.pull({ _id: req.params.taskId });

    // Recalculate overall completion percentage
    if (project.tasks.length > 0) {
      const sum = project.tasks.reduce((acc, t) => acc + (t.completionPercentage || 0), 0);
      project.taskCompletionPercentage = Math.round(sum / project.tasks.length);
    } else {
      project.taskCompletionPercentage = 0;
    }

    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
