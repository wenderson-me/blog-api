import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  statusCode?: number;
}

const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction): Response => {
  console.error(err.stack);

  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Erro interno do servidor'
  });
};

export default errorHandler;