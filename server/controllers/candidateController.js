import Candidate from '../models/Candidate.js';
import ControlLimits from '../models/ControlLimits.js';

// Helper to check limits
const checkProgramLimit = async (category, programsLength) => {
  const controlLimits = await ControlLimits.findOne();
  if (controlLimits && controlLimits.categoryLimits) {
    const catLimit = controlLimits.categoryLimits.find(c => c.category.toLowerCase() === category.toLowerCase());
    if (catLimit && catLimit.count !== null && catLimit.count !== undefined) {
      if (programsLength > catLimit.count) {
        throw new Error(`Maximum ${catLimit.count} programs allowed for category ${category}`);
      }
    }
  }
};

// @desc    Get all candidates (Admin only)
// @route   GET /api/candidates
export const getAllCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find().populate('team').sort({ createdAt: -1 });
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch all candidates' });
  }
};

// @desc    Get all candidates for a specific team
// @route   GET /api/candidates/team/:teamId
export const getCandidatesByTeam = async (req, res) => {
  try {
    const candidates = await Candidate.find({ team: req.params.teamId }).sort({ createdAt: -1 });
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch candidates' });
  }
};

// @desc    Create a candidate
// @route   POST /api/candidates
export const createCandidate = async (req, res) => {
  try {
    const { name, gender, className, category, programs, team, status } = req.body;
    
    if (programs && programs.length > 0) {
      await checkProgramLimit(category, programs.length);
    }
    
    const candidate = await Candidate.create({
      name,
      gender,
      className,
      category,
      programs,
      team,
      status: status || 'Active'
    });

    res.status(201).json(candidate);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to create candidate' });
  }
};

// @desc    Update a candidate
// @route   PUT /api/candidates/:id
export const updateCandidate = async (req, res) => {
  try {
    const candidateToUpdate = await Candidate.findById(req.params.id);
    if (!candidateToUpdate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    const category = req.body.category || candidateToUpdate.category;
    const programs = req.body.programs || candidateToUpdate.programs;

    if (req.body.programs) {
      await checkProgramLimit(category, programs.length);
    }

    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(candidate);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to update candidate' });
  }
};

// @desc    Delete a candidate
// @route   DELETE /api/candidates/:id
export const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    res.json({ message: 'Candidate removed' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete candidate' });
  }
};
