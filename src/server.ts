import dotenv from 'dotenv';
import app from './app';
import dbConnect from './utils/database';

dotenv.config();

dbConnect();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Servidor rodando em modo ${process.env.NODE_ENV} na porta ${PORT}`);
});

process.on('unhandledRejection', (err: Error) => {
  console.log(`Erro: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});