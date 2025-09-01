"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("../src/app"));
// Exportar o app como uma função de manipulação de requisições
exports.default = (req, res) => {
    return (0, app_1.default)(req, res);
};
