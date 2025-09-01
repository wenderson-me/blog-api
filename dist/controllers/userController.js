"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUser = exports.createUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const createUser = async (req, res) => {
    try {
        const { name, email, password, avatar, bio, role } = req.body;
        const user = await User_1.default.create({ name, email, password, avatar, bio, role });
        const userObject = user.toObject();
        res.status(201).json({ success: true, user: userObject });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.createUser = createUser;
const getUser = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
        }
        res.status(200).json({ success: true, user });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getUser = getUser;
const updateUser = async (req, res) => {
    try {
        const updates = { ...req.body };
        if (updates.password)
            delete updates.password;
        const user = await User_1.default.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
        }
        res.status(200).json({ success: true, user });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const user = await User_1.default.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
        }
        res.status(200).json({ success: true, message: 'Usuário deletado com sucesso' });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.deleteUser = deleteUser;
