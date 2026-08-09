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
    
    // Check for duplicate candidate
    const existingCandidate = await Candidate.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }, 
      team, 
      category 
    });
    if (existingCandidate) {
      const chestNoText = existingCandidate.chestNo ? ` Their chest number is ${existingCandidate.chestNo}.` : '';
      return res.status(400).json({ message: `A candidate with the name "${name}" in the "${category}" category already exists in your team.${chestNoText}` });
    }

    if (programs && programs.length > 0) {
      await checkProgramLimit(category, programs.length);
    }

    let chestNoStr = null;
    const catLower = category.toLowerCase();
    
    if (!catLower.includes('kids') && !catLower.includes('kiddies')) {
      let baseChestNo = 501; // default fallback
      if (catLower.includes('sub junior') || catLower.includes('sub-junior')) baseChestNo = 101;
      else if (catLower.includes('super senior') || catLower.includes('super-senior')) baseChestNo = 401;
      else if (catLower.includes('junior')) baseChestNo = 201;
      else if (catLower.includes('senior')) baseChestNo = 301;

      // Find the max chestNo in this category by fetching and parsing
      const candidatesInCategory = await Candidate.find({ category }).select('chestNo').lean();
      let maxNum = baseChestNo - 1;
      for (const c of candidatesInCategory) {
        if (c.chestNo) {
          const num = parseInt(c.chestNo, 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }
      let nextChestNo = maxNum + 1;

      // Ensure uniqueness
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 100) {
        const existing = await Candidate.findOne({ chestNo: nextChestNo.toString() }).lean();
        if (existing) {
          nextChestNo++;
          attempts++;
        } else {
          isUnique = true;
        }
      }
      chestNoStr = nextChestNo.toString();
    }
    
    const candidate = await Candidate.create({
      name,
      gender,
      className,
      category,
      ...(chestNoStr && { chestNo: chestNoStr }),
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

// @desc    Get candidate and their published results by chest no
// @route   GET /api/candidates/result/:chestNo
export const getStudentResultByChestNo = async (req, res) => {
  try {
    const { chestNo } = req.params;
    const candidate = await Candidate.findOne({ chestNo }).populate('team');
    
    if (!candidate) {
      return res.status(404).json({ message: 'Student not found with this chest number' });
    }

    const Result = (await import('../models/Result.js')).default;
    const publishedResults = await Result.find({ status: 'Published' }).populate('program');

    const studentResults = [];

    for (const result of publishedResults) {
      if (!result.program) continue;

      if (result.program.type === 'Group') {
        const groupName = candidate.groupAssignments?.get(result.program._id.toString());
        if (groupName) {
           const winnerRecord = result.winners.find(w => 
             w.team && w.team.toString() === candidate.team._id.toString() && w.name === groupName
           );
           
           if (winnerRecord) {
             const membersCount = await Candidate.countDocuments({
               team: candidate.team._id,
               [`groupAssignments.${result.program._id.toString()}`]: groupName,
               status: 'Active'
             });
             
             studentResults.push({
               program: result.program,
               position: winnerRecord.position,
               grade: winnerRecord.grade,
               points: membersCount > 0 ? (winnerRecord.points / membersCount) : winnerRecord.points
             });
           }
        }
      } else {
        const winnerRecord = result.winners.find(w => w.chestNo === chestNo);
        if (winnerRecord) {
          studentResults.push({
            program: result.program,
            position: winnerRecord.position,
            grade: winnerRecord.grade,
            points: winnerRecord.points
          });
        }
      }
    }

    res.json({
      candidate,
      results: studentResults
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch student results' });
  }
};

// @desc    Toggle candidate absent status for a program
// @route   PUT /api/candidates/:id/absent
export const toggleAbsentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { programId } = req.body;
    
    const candidate = await Candidate.findById(id);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    
    const index = candidate.absentPrograms.indexOf(programId);
    if (index === -1) {
      candidate.absentPrograms.push(programId);
    } else {
      candidate.absentPrograms.splice(index, 1);
    }
    
    await candidate.save();
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle absent status' });
  }
};
