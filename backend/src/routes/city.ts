import { Router } from 'express';
import { handleGetActiveCities } from '../controllers/cityController';

const router = Router();

// Rota pública - usada pelo app mobile
router.get('/', handleGetActiveCities);

export default router;
