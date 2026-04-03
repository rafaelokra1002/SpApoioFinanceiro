import { Router } from 'express';
import {
  handleCreateLead,
  handleUploadDocuments,
  handleCreateLeadWithDocs,
} from '../controllers/leadController';
import { validate, leadSchema } from '../middleware/validation';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/', validate(leadSchema), handleCreateLead);

router.post(
  '/:leadId/documents',
  upload.array('documentos', 10),
  handleUploadDocuments
);

router.post(
  '/complete',
  upload.array('documentos', 10),
  handleCreateLeadWithDocs
);

export default router;
