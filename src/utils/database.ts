import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let cachedDb: typeof mongoose | null = null;

const dbConnect = async (): Promise<typeof mongoose> => {
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

    const client = await mongoose.connect(uri);
    cachedDb = client;
    console.log('Conectado ao MongoDB com sucesso');
    return client;
  } catch (error) {
    console.error('Erro na conexão com MongoDB:', error);
    throw error;
  }
};

export default dbConnect;