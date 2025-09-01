"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
const database_1 = __importDefault(require("./utils/database"));
dotenv_1.default.config();
(0, database_1.default)();
const PORT = process.env.PORT || 5000;
const server = app_1.default.listen(PORT, () => {
    console.log(`Servidor rodando em modo ${process.env.NODE_ENV} na porta ${PORT}`);
});
process.on('unhandledRejection', (err) => {
    console.log(`Erro: ${err.message}`);
    server.close(() => {
        process.exit(1);
    });
});
