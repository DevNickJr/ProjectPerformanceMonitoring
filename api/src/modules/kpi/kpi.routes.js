import express from 'express';
import KPIEntry from './kpi.model.js';
import Project from '../project/project.model.js';
import { authenticate } from '../auth/auth.routes.js';

const router = express.Router();

// Helper for calculations
const calculateMetrics = (entry, bac) => {
  const { plannedValue: PV, earnedValue: EV, actualCost: AC } = entry;
  const CV = EV - AC;
  const SV = EV - PV;
  const CPI = AC !== 0 ? (EV / AC) : 1;
  const SPI = PV !== 0 ? (EV / PV) : 1;
  const EAC = CPI !== 0 ? (AC + (bac - EV) / CPI) : bac;
  
  let alert = 'None';
  if (CPI < 0.85 || SPI < 0.85) {
    alert = 'Critical';
  } else if (CPI < 0.95 || SPI < 0.95) {
    alert = 'At Risk';
  }

  return { CV, SV, CPI, SPI, EAC, alert };
};

// Add KPI Entry
router.post('/:projectId', authenticate, async (req, res) => {
  if (req.user.role === 'viewer') return res.status(403).json({ message: 'Forbidden' });

  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const entry = new KPIEntry({
      ...req.body,
      projectId: project._id,
      enteredBy: req.user.id
    });

    await entry.save();

    // Calculate metrics
    const metrics = calculateMetrics(entry, project.budgetAtCompletion);

    const payload = {
      entry,
      metrics
    };

    // Emit Socket.IO event to room
    req.io.to(`project:${project._id}`).emit('new_kpi_entry', payload);

    res.status(201).json(payload);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'KPI entry for this week already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get KPI Entries for a project
router.get('/:projectId', authenticate, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const entries = await KPIEntry.find({ projectId: project._id }).sort({ weekNumber: 1 });
    
    // Calculate metrics on the fly
    const data = entries.map(entry => {
      const metrics = calculateMetrics(entry, project.budgetAtCompletion);
      return { entry, metrics };
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
