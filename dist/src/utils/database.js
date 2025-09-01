"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
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
        const client = await mongoose_1.default.connect(uri);
        cachedDb = client;
        console.log('Conectado ao MongoDB com sucesso');
        return client;
    }
    catch (error) {
        console.error('Erro na conexão com MongoDB:', error);
        throw error;
    }
};
exports.default = dbConnect;
