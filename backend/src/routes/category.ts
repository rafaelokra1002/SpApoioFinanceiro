import { Router } from 'express';
import {
  handleGetActiveCategories,
} from '../controllers/categoryController';

const router = Router();

// Public route - used by mobile
router.get('/', handleGetActiveCategories);

export default router;
