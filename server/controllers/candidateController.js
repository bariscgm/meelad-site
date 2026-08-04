import Candidate from '../models/Candidate.js';

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
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

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
