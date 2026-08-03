import Team from '../models/Team.js';

export const getTeams = async (req, res) => {
  try {
    const teams = await Team.find({}).sort({ createdAt: -1 });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

export const addTeam = async (req, res) => {
  try {
    const { name, code, color, status } = req.body;
    
    const teamExists = await Team.findOne({ code });
    if (teamExists) {
      return res.status(400).json({ message: 'Team code already exists' });
    }

    const team = await Team.create({
      name,
      code,
      color,
      status
    });
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

export const updateTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (team) {
      team.name = req.body.name || team.name;
      team.code = req.body.code || team.code;
      team.color = req.body.color || team.color;
      team.status = req.body.status || team.status;

      const updatedTeam = await team.save();
      res.json(updatedTeam);
    } else {
      res.status(404).json({ message: 'Team not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (team) {
      await team.deleteOne();
      res.json({ message: 'Team removed' });
    } else {
      res.status(404).json({ message: 'Team not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};
