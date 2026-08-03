import Program from '../models/Program.js';

// @desc    Get all programs
// @route   GET /api/programs
// @access  Public (or Admin/Team Leader)
export const getPrograms = async (req, res) => {
  try {
    const programs = await Program.find({})
      .populate('assignedJudges', 'name username role')
      .sort({ createdAt: -1 });
    res.json(programs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Create a program
// @route   POST /api/programs
// @access  Admin
export const addProgram = async (req, res) => {
  try {
    const { name, category, type, venueType, gender, maxParticipants, duration, class: programClass, status, assignedJudges } = req.body;

    if (!name || !category) {
      return res.status(400).json({ message: 'Name and Category are required' });
    }

    const program = new Program({
      name,
      category,
      type,
      venueType,
      gender,
      maxParticipants,
      duration,
      class: programClass,
      status: status || 'Pending',
      assignedJudges: assignedJudges || [],
    });

    const createdProgram = await program.save();
    res.status(201).json(createdProgram);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Update a program
// @route   PUT /api/programs/:id
// @access  Admin
export const updateProgram = async (req, res) => {
  try {
    const { name, category, type, venueType, gender, maxParticipants, duration, class: programClass, status, assignedJudges } = req.body;

    const program = await Program.findById(req.params.id);

    if (program) {
      program.name = name || program.name;
      program.category = category || program.category;
      program.type = type || program.type;
      program.venueType = venueType || program.venueType;
      program.gender = gender || program.gender;
      program.maxParticipants = maxParticipants || program.maxParticipants;
      program.duration = duration || program.duration;
      program.class = programClass !== undefined ? programClass : program.class;
      program.status = status || program.status;
      program.assignedJudges = assignedJudges || program.assignedJudges;

      const updatedProgram = await program.save();
      res.json(updatedProgram);
    } else {
      res.status(404).json({ message: 'Program not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Delete a program
// @route   DELETE /api/programs/:id
// @access  Admin
export const deleteProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);

    if (program) {
      await program.deleteOne();
      res.json({ message: 'Program removed' });
    } else {
      res.status(404).json({ message: 'Program not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Bulk create programs from CSV/Excel
// @route   POST /api/programs/bulk
// @access  Admin
export const bulkCreatePrograms = async (req, res) => {
  try {
    const programs = req.body;
    
    if (!Array.isArray(programs) || programs.length === 0) {
      return res.status(400).json({ message: 'Programs array is required and cannot be empty' });
    }

    // Normalize keys to handle different Excel header names (remove spaces & special chars)
    const normalizeKey = (key) => key.toLowerCase().replace(/[^a-z0-9]/g, '');

    const normalizedPrograms = programs.map(p => {
      const normalized = {};
      for (const [key, value] of Object.entries(p)) {
        normalized[normalizeKey(key)] = value;
      }
      return normalized;
    });

    const formatType = (val) => {
      if (!val) return 'Individual';
      const s = String(val).trim().toLowerCase();
      if (s.includes('group')) return 'Group';
      return 'Individual';
    };

    const formatVenue = (val) => {
      if (!val) return 'STAGE';
      const s = String(val).trim().toUpperCase();
      if (s.includes('OFF')) return 'OFF-STAGE';
      return 'STAGE';
    };

    const formatGender = (val) => {
      if (!val) return 'General';
      const s = String(val).trim().toLowerCase();
      if (s.includes('boy')) return 'Boy';
      if (s.includes('girl')) return 'Girl';
      return 'General';
    };

    const programsToInsert = normalizedPrograms.map(p => ({
      name: p.name || p.programmename || p.program || p.item,
      category: p.category,
      type: formatType(p.type),
      venueType: formatVenue(p.venuetype || p.venue || p.stageoffstage || p.stage),
      gender: formatGender(p.gender),
      maxParticipants: p.maxparticipants || p.participants || p.noofparticipants ? Number(p.maxparticipants || p.participants || p.noofparticipants) : 1,
      duration: p.duration || '10 mins',
      class: p.class,
      status: 'Pending',
      assignedJudges: [],
    })).filter(p => p.name && p.category); // Name and Category are required

    if (programsToInsert.length === 0) {
      return res.status(400).json({ message: 'No valid programs found in the uploaded data. Ensure name and category are present.' });
    }

    const insertedPrograms = await Program.insertMany(programsToInsert);
    res.status(201).json({ 
      message: `${insertedPrograms.length} programs successfully imported.`, 
      count: insertedPrograms.length,
      data: insertedPrograms 
    });
  } catch (error) {
    res.status(500).json({ message: 'Bulk Import Error: ' + error.message });
  }
};
