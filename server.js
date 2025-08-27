const dotenv = require('dotenv');
const app = require('./src/app.js');
const dbConnect = require('./src/utils/database.js');

dotenv.config();

dbConnect();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Servidor rodando em modo ${process.env.NODE_ENV} na porta ${PORT}`);
});

process.on('unhandledRejection', (err, promise) => {
  console.log(`Erro: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});