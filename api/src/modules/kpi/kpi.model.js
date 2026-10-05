import mongoose from 'mongoose';

const kpiEntrySchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  weekNumber: { type: Number, required: true },
  plannedValue: { type: Number, required: true }, // PV
  earnedValue: { type: Number, required: true }, // EV
  actualCost: { type: Number, required: true }, // AC
  nonConformances: { type: Number, default: 0 },
  safetyIncidents: { type: Number, default: 0 },
  enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dateRecorded: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure one entry per week per project
kpiEntrySchema.index({ projectId: 1, weekNumber: 1 }, { unique: true });

export default mongoose.model('KPIEntry', kpiEntrySchema);
