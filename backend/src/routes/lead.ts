import { Router } from 'express';
import {
  handleCreateLead,
  handleUploadDocuments,
  handleCreateLeadWithDocs,
  handleUploadSingleDocument,
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

// Um arquivo por requisição: cada envio termina rápido mesmo com internet fraca
// (o proxy da hospedagem corta requisições que passam de 60s).
router.post('/upload', upload.single('documento'), handleUploadSingleDocument);

router.post(
  '/complete',
  upload.array('documentos', 10),
  handleCreateLeadWithDocs
);

export default router;
