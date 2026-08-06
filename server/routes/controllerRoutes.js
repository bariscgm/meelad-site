import express from 'express';
import bcrypt from 'bcryptjs';
import Announcement from '../models/Announcement.js';
import Download from '../models/Download.js';
import ControlLimits from '../models/ControlLimits.js';
import User from '../models/User.js';

const router = express.Router();

// --- LIMITS ENDPOINTS ---
router.get('/limits', async (req, res) => {
  try {
    let limits = await ControlLimits.findOne();
    if (!limits) {
      limits = await ControlLimits.create({
        registrationOpen: true,
        categoryLimits: [
          { category: 'For person', count: 3 },
        ],
        generalLimits: { stageIndividual: 3, stageGroup: 2, offstageIndividual: 4, offstageGroup: 3 },
      });
    }
    res.json({ success: true, data: limits });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/limits', async (req, res) => {
  try {
    let limits = await ControlLimits.findOne();
    if (!limits) {
      limits = new ControlLimits(req.body);
    } else {
      Object.assign(limits, req.body);
    }
    await limits.save();
    res.json({ success: true, message: 'Limits saved to Database', data: limits });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- USERS ENDPOINTS ---
router.get('/users', async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) {
      filter.role = req.query.role;
    }
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { name, username, password, role, team } = req.body;
    
    // Explicitly hash password using bcrypt as requested
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || '123456', salt);
    
    const newUser = await User.create({
      name,
      username: username.toLowerCase().trim(),
      password: hashedPassword,
      role: role || 'Team Leader',
      team: team || 'Unassigned',
      status: 'Active',
    });
    res.status(201).json({ success: true, data: newUser });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { name, username, password, role, team, status } = req.body;
    const user = await User.findById(req.params.id);
    
    if (user) {
      user.name = name || user.name;
      if (username) {
        user.username = username.toLowerCase().trim();
      }
      user.role = role || user.role;
      user.team = team || user.team;
      user.status = status || user.status;
      
      if (password && password.trim() !== '') {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
      }
      
      const updatedUser = await user.save();
      // Don't send back the hashed password
      const userToReturn = await User.findById(updatedUser._id).select('-password');
      res.json({ success: true, data: userToReturn });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User removed from DB' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- ANNOUNCEMENTS ENDPOINTS ---
router.get('/announcements', async (req, res) => {
  try {
    const list = await Announcement.find().sort({ createdAt: -1 });
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/announcements', async (req, res) => {
  try {
    const newAnn = await Announcement.create(req.body);
    res.status(201).json({ success: true, data: newAnn });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/announcements/:id', async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Announcement deleted from DB' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- DOWNLOADS ENDPOINTS ---
router.get('/downloads', async (req, res) => {
  try {
    const list = await Download.find().sort({ createdAt: -1 });
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/downloads', async (req, res) => {
  try {
    const newDown = await Download.create(req.body);
    res.status(201).json({ success: true, data: newDown });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/downloads/:id', async (req, res) => {
  try {
    await Download.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Download file removed from DB' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- DANGER ZONE SYSTEM RESET ENDPOINT ---
router.post('/reset', async (req, res) => {
  try {
    const { confirmText } = req.body;
    if (confirmText !== 'RESET ILMUL RASOOL') {
      return res.status(400).json({ success: false, message: 'Invalid confirmation string' });
    }
    await Announcement.deleteMany({});
    await Download.deleteMany({});
    await ControlLimits.deleteMany({});
    res.json({ success: true, message: 'All database collections successfully cleared.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
