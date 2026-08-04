import express from 'express';
import User from '../models/User.js';
import Team from '../models/Team.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user by username
    const user = await User.findOne({ username: username.toLowerCase().trim() });
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
    
    // Check if user is active
    if (user.status !== 'Active') {
      return res.status(403).json({ success: false, message: 'Your account is inactive or disabled' });
    }
    
    // Compare password using bcrypt method on user model
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
    
    let actualTeamId = user._id;
    if (user.role === 'Team Leader' && user.team && user.team !== 'Unassigned') {
      const teamDoc = await Team.findOne({ name: user.team });
      if (teamDoc) {
        actualTeamId = teamDoc._id;
      }
    }
    
    // Send user details back (excluding password)
    const userData = {
      id: user._id,
      teamId: actualTeamId,
      name: user.name,
      username: user.username,
      role: user.role,
      team: user.team,
      status: user.status
    };
    
    res.json({ success: true, user: userData, message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
