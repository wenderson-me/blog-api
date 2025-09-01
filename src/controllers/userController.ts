import { Request, Response } from 'express';
import User from '../models/User';

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, avatar, bio, role } = req.body;
    const user = await User.create({ name, email, password, avatar, bio, role });

    const userObject = user.toObject();

    res.status(201).json({ success: true, user: userObject });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getUser = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }
    res.status(200).json({ success: true, user });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const updates = { ...req.body };
    if (updates.password) delete updates.password;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    res.status(200).json({ success: true, user });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }
    res.status(200).json({ success: true, message: 'Usuário deletado com sucesso' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};