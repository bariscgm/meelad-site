import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  stages: {
    type: Array, // Array of stage objects containing stageName, items, etc.
    default: []
  },
  report: {
    type: Object, // The breakdown, totals, feasibility etc.
    default: {}
  }
}, {
  timestamps: true
});

const Schedule = mongoose.model('Schedule', scheduleSchema);
export default Schedule;
