import { Router } from 'express';
import { handleSimulation } from '../controllers/simulationController';
import { validate, simulationSchema } from '../middleware/validation';

const router = Router();

router.post('/', validate(simulationSchema), handleSimulation);

export default router;
