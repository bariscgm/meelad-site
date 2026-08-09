import express from 'express';
import { 
  createCandidate, 
  getCandidatesByTeam, 
  getAllCandidates,
  updateCandidate, 
  deleteCandidate,
  getStudentResultByChestNo
} from '../controllers/candidateController.js';

const router = express.Router();

router.post('/', createCandidate);
router.get('/', getAllCandidates);
router.get('/result/:chestNo', getStudentResultByChestNo);
router.get('/team/:teamId', getCandidatesByTeam);
router.put('/:id', updateCandidate);
router.delete('/:id', deleteCandidate);

export default router;
