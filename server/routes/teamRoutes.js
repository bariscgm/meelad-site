import express from 'express';
import { getTeams, addTeam, updateTeam, deleteTeam } from '../controllers/teamController.js';

const router = express.Router();

router.route('/')
  .get(getTeams)
  .post(addTeam);

router.route('/:id')
  .put(updateTeam)
  .delete(deleteTeam);

export default router;
