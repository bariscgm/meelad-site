import express from 'express';
import { getPrograms, addProgram, updateProgram, deleteProgram, bulkCreatePrograms } from '../controllers/programController.js';

const router = express.Router();

router.route('/')
  .get(getPrograms)
  .post(addProgram);

router.post('/bulk', bulkCreatePrograms);

router.route('/:id')
  .put(updateProgram)
  .delete(deleteProgram);

export default router;
