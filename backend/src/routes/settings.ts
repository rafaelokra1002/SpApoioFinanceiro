import { Router } from 'express';
import { handleGetModalidadePagamento } from '../controllers/settingsController';

const router = Router();

// Rota pública - usada pelo app mobile
router.get('/modalidade-pagamento', handleGetModalidadePagamento);

export default router;
