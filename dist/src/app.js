"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const database_1 = __importDefault(require("./utils/database"));
const fs_1 = __importDefault(require("fs"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const path_1 = __importDefault(require("path"));
const auth_1 = __importDefault(require("./routes/auth"));
const posts_1 = __importDefault(require("./routes/posts"));
const users_1 = __importDefault(require("./routes/users"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
(0, database_1.default)().catch(err => console.error('Erro ao conectar ao banco de dados:', err));
const swaggerPath = path_1.default.resolve(process.cwd(), 'swagger.yaml');
let swaggerDocument;
try {
    swaggerDocument = js_yaml_1.default.load(fs_1.default.readFileSync(swaggerPath, 'utf8'));
}
catch (error) {
    console.error('Erro ao carregar o arquivo swagger.yaml:', error);
    swaggerDocument = {};
}
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
try {
    app.use('/api/v1/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
}
catch (error) {
    console.error('Erro ao configurar Swagger UI:', error);
}
app.use('/api/v1/auth', auth_1.default);
app.use('/api/v1/posts', posts_1.default);
app.use('/api/v1/users', users_1.default);
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API funcionando!'
    });
});
app.use(errorHandler_1.default);
app.all('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Rota ${req.originalUrl} não encontrada`
    });
});
exports.default = app;
