import Result from '../models/Result.js';
import Program from '../models/Program.js';

// Get all results (for Controller)
export const getResults = async (req, res) => {
  try {
    const results = await Result.find()
      .populate('program')
      .populate('judge', 'name')
      .populate('winners.team');
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get published results (for Live Scoreboard)
export const getPublishedResults = async (req, res) => {
  try {
    const results = await Result.find({ status: 'Published' })
      .populate('program')
      .populate('winners.team')
      .sort({ updatedAt: -1 });
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single result
export const getResultById = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('program')
      .populate('winners.team');
    if (!result) return res.status(404).json({ message: 'Result not found' });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a result (Judge submission)
export const createResult = async (req, res) => {
  try {
    const { program, judge, winners } = req.body;
    const newResult = new Result({
      program,
      judge,
      winners,
      status: 'Draft', // Defaults to Draft, waiting for Controller to publish
    });
    const savedResult = await newResult.save();
    
    // Update program status to Finished
    await Program.findByIdAndUpdate(program, { status: 'Finished' });

    // Emit real-time event to all connected clients
    const io = req.app.get('io');
    if (io) {
      const populated = await Result.findById(savedResult._id)
        .populate('program')
        .populate('winners.team');
      io.emit('result:created', populated);
    }

    res.status(201).json(savedResult);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update result (Controller modifying or publishing)
export const updateResult = async (req, res) => {
  try {
    const { status, winners } = req.body;
    const result = await Result.findById(req.params.id);
    if (!result) return res.status(404).json({ message: 'Result not found' });

    if (status) result.status = status;
    if (winners) result.winners = winners;
    
    const updatedResult = await result.save();

    // Emit real-time event — especially important when status changes to 'Published'
    const io = req.app.get('io');
    if (io) {
      const populated = await Result.findById(updatedResult._id)
        .populate('program')
        .populate('winners.team');
      io.emit('result:updated', populated);

      // If published, also notify scoreboard room specifically
      if (status === 'Published') {
        io.to('scoreboard').emit('scoreboard:update', populated);
      }
    }

    res.status(200).json(updatedResult);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete result
export const deleteResult = async (req, res) => {
  try {
    const result = await Result.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: 'Result not found' });
    
    // Optionally set program back to Pending
    await Program.findByIdAndUpdate(result.program, { status: 'Pending' });

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.emit('result:deleted', { id: req.params.id, programId: result.program });
    }

    res.status(200).json({ message: 'Result deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
