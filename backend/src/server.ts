import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import simulationRoutes from './routes/simulation';
import leadRoutes from './routes/lead';
import adminRoutes from './routes/admin';
import categoryRoutes from './routes/category';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', true);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (uploads)
const uploadDir = process.env.UPLOAD_DIR || './uploads';
app.use('/uploads', express.static(path.resolve(uploadDir)));

// Rotas
app.use('/api/simulation', simulationRoutes);
app.use('/api/lead', leadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'SP Apoio Financeiro API está funcionando!',
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📁 Uploads em: ${path.resolve(uploadDir)}`);
  console.log(`📊 Admin API: http://localhost:${PORT}/api/admin`);
  console.log(`💰 Simulation API: http://localhost:${PORT}/api/simulation\n`);
});

export default app;
