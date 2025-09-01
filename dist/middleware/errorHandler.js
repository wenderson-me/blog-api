"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Erro interno do servidor'
    });
};
exports.default = errorHandler;
