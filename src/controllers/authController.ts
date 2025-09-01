import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import type { StringValue } from 'ms';

type JwtPayload = {
  id: string;
};

const signToken = (id: string): string => {
  const payload: JwtPayload = { id };
  const secret = process.env.JWT_SECRET || '';
  const expiresIn = process.env.JWT_EXPIRE as StringValue || '30d' as StringValue;
  const options: SignOptions = { expiresIn };

  return jwt.sign(payload, secret, options);
};

const createSendToken = (user: IUser, statusCode: number, res: Response): void => {
  const userId = user._id ? user._id.toString() : '';
  const token = signToken(userId);

  const userObject = user.toObject();
  delete userObject.password;

  res.status(statusCode).json({
    success: true,
    token,
    data: { user: userObject }
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, avatar, bio } = req.body;

    const user = await User.create({
      name,
      email,
      password,
      role,
      avatar,
      bio,
    });

    createSendToken(user, 201, res);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const login = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    createSendToken(user, 200, res);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};