import { Router } from 'express';
import {
  handleGetLeads,
  handleGetLeadById,
  handleUpdateStatus,
  handleDeleteLead,
  handleGetStats,
} from '../controllers/adminController';
import { validate, statusSchema } from '../middleware/validation';

const router = Router();

router.get('/stats', handleGetStats);
router.get('/leads', handleGetLeads);
router.get('/leads/:id', handleGetLeadById);
router.patch('/leads/:id/status', validate(statusSchema), handleUpdateStatus);
router.delete('/leads/:id', handleDeleteLead);

export default router;
