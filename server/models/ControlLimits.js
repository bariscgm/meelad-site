import mongoose from 'mongoose';

const categoryLimitSchema = new mongoose.Schema({
  category: String,
  count: Number,
});

const controlLimitsSchema = new mongoose.Schema({
  registrationOpen: {
    type: Boolean,
    default: true,
  },
  categoryLimits: [categoryLimitSchema],
}, { timestamps: true });

const ControlLimits = mongoose.model('ControlLimits', controlLimitsSchema);
export default ControlLimits;
