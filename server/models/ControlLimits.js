import mongoose from 'mongoose';

const categoryLimitSchema = new mongoose.Schema({
  category: String,
  stage: Number,
  offstage: Number,
});

const controlLimitsSchema = new mongoose.Schema({
  registrationOpen: {
    type: Boolean,
    default: true,
  },
  categoryLimits: [categoryLimitSchema],
  generalLimits: {
    stageIndividual: { type: Number, default: 3 },
    stageGroup: { type: Number, default: 2 },
    offstageIndividual: { type: Number, default: 4 },
    offstageGroup: { type: Number, default: 3 },
  },
}, { timestamps: true });

const ControlLimits = mongoose.model('ControlLimits', controlLimitsSchema);
export default ControlLimits;
