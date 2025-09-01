import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dbConnect from './utils/database';
import fs from 'fs';
import yaml from 'js-yaml';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

import authRoutes from './routes/auth';
import postRoutes from './routes/posts';
import userRoutes from './routes/users';
import errorHandler from './middleware/errorHandler';

dbConnect().catch(err => console.error('Erro ao conectar ao banco de dados:', err));

const swaggerPath = path.resolve(process.cwd(), 'swagger.yaml');
let swaggerDocument;
try {
  swaggerDocument = yaml.load(fs.readFileSync(swaggerPath, 'utf8'));
} catch (error) {
  console.error('Erro ao carregar o arquivo swagger.yaml:', error);
  swaggerDocument = {};
}

const app = express();

app.use(express.json());

app.use(cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

try {
  app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument as swaggerUi.JsonObject));
} catch (error) {
  console.error('Erro ao configurar Swagger UI:', error);
}
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/users', userRoutes);

app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API funcionando!'
  });
});

app.use(errorHandler);

app.all('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Rota ${req.originalUrl} não encontrada`
  });
});

export default app;