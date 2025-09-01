import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

// Estendendo a interface Request para incluir o usuário
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

interface JwtPayload {
  id: string;
}

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acesso negado. Token não fornecido.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para acessar esta rota'
      });
    }
    next();
  };
};