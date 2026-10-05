import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  budgetAtCompletion: { type: Number, required: true }, // BAC
  plannedDurationWeeks: { type: Number, required: true },
  startDate: { type: Date, default: Date.now },
  kpiPriorities: {
    cost: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    schedule: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    quality: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    safety: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' }
  },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
