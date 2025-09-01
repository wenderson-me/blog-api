const mongoose = require('mongoose');
require('dotenv').config();

let cachedDb = null;

const dbConnect = async () => {
  if (cachedDb) {
    console.log('Usando conexão existente com o MongoDB');
    return cachedDb;
  }

  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI não definida nas variáveis de ambiente');
    }

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    const client = await mongoose.connect(uri, options);
    cachedDb = client;
    console.log('Conectado ao MongoDB com sucesso');
    return client;
  } catch (error) {
    console.error('Erro na conexão com MongoDB:', error);
    throw error;
  }
};

module.exports = dbConnect;