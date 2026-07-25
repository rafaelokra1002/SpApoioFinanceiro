import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf',
    // Vídeos das mídias de garantia (ex.: "Vídeo do bem", até 60s).
    'video/mp4',
    'video/quicktime',
    'video/webm',
    'video/3gpp',
    'video/x-matroska',
  ];

  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.mp4', '.mov', '.webm', '.3gp', '.m4v', '.mkv'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('video/') || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Use JPEG, PNG, WebP, PDF ou vídeo.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    // Vídeos de garantia (até 60s) são bem maiores que fotos/PDF.
    fileSize: 150 * 1024 * 1024,
    files: 15,
  },
});
