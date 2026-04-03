import { Router } from 'express';
import {
  handleGetLeads,
  handleGetLeadById,
  handleUpdateStatus,
  handleDeleteLead,
  handleGetStats,
} from '../controllers/adminController';
import {
  handleGetCategories,
  handleCreateCategory,
  handleUpdateCategory,
  handleDeleteCategory,
  handleAddDocument,
  handleUpdateDocument,
  handleDeleteDocument,
  handleSeedCategories,
} from '../controllers/categoryController';
import { validate, statusSchema } from '../middleware/validation';

const router = Router();

router.get('/stats', handleGetStats);
router.get('/leads', handleGetLeads);
router.get('/leads/:id', handleGetLeadById);
router.patch('/leads/:id/status', validate(statusSchema), handleUpdateStatus);
router.delete('/leads/:id', handleDeleteLead);

// Category management
router.get('/categories', handleGetCategories);
router.post('/categories', handleCreateCategory);
router.post('/categories/seed', handleSeedCategories);
router.put('/categories/:id', handleUpdateCategory);
router.delete('/categories/:id', handleDeleteCategory);
router.post('/categories/:id/documents', handleAddDocument);
router.put('/categories/documents/:docId', handleUpdateDocument);
router.delete('/categories/documents/:docId', handleDeleteDocument);

export default router;
