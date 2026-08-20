import express from 'express';
import Schedule from '../models/Schedule.js';

const router = express.Router();

// Get all saved schedules
router.get('/', async (req, res) => {
  try {
    const schedules = await Schedule.find().sort({ createdAt: -1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch schedules', error: error.message });
  }
});

// Save or Update a schedule by name
router.post('/', async (req, res) => {
  try {
    const { name, stages, report } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Schedule name is required' });
    }

    // Find if a schedule with this name exists, update it or create new
    let schedule = await Schedule.findOne({ name });
    
    if (schedule) {
      schedule.stages = stages;
      schedule.report = report;
      await schedule.save();
    } else {
      schedule = new Schedule({
        name,
        stages,
        report
      });
      await schedule.save();
    }

    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Failed to save schedule', error: error.message });
  }
});

// Delete a schedule
router.delete('/:id', async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete schedule', error: error.message });
  }
});

export default router;
