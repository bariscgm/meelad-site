import express from 'express';
import { getPrograms, addProgram, updateProgram, deleteProgram, bulkCreatePrograms, deleteAllPrograms, getProgramCandidates, shuffleProgramCodes } from '../controllers/programController.js';

const router = express.Router();

router.route('/')
  .get(getPrograms)
  .post(addProgram)
  .delete(deleteAllPrograms);

router.post('/bulk', bulkCreatePrograms);

router.route('/:id')
  .put(updateProgram)
  .delete(deleteProgram);

router.get('/:id/candidates', getProgramCandidates);
router.post('/:id/shuffle-codes', shuffleProgramCodes);

export default router;
