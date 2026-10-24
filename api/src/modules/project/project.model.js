import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  budgetAtCompletion: { type: Number, required: true }, // BAC
  plannedDurationWeeks: { type: Number, required: true },
  startDate: { type: Date, default: Date.now },
  currency: {
    type: String,
    default: 'NGN',
    enum: ['NGN', 'USD', 'GBP', 'EUR', 'CAD', 'GHS', 'ZAR', 'CNY', 'JPY']
  },
  tasks: [{
    title: { type: String, required: true },
    description: { type: String, default: '' },
    assignedTo: { type: String, default: '' },
    dueDate: { type: Date },
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
    completionPercentage: { type: Number, min: 0, max: 100, default: 0 },
    createdAt: { type: Date, default: Date.now }
  }],
  taskCompletionPercentage: { type: Number, min: 0, max: 100, default: 0 },
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
