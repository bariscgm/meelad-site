import express from 'express';
import { getPrograms, addProgram, updateProgram, deleteProgram, bulkCreatePrograms, deleteAllPrograms } from '../controllers/programController.js';

const router = express.Router();

router.route('/')
  .get(getPrograms)
  .post(addProgram)
  .delete(deleteAllPrograms);

router.post('/bulk', bulkCreatePrograms);

router.route('/:id')
  .put(updateProgram)
  .delete(deleteProgram);

export default router;
