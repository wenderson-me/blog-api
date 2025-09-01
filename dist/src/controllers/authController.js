"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const signToken = (id) => {
    const payload = { id };
    const secret = process.env.JWT_SECRET || '';
    const expiresIn = process.env.JWT_EXPIRE || '30d';
    const options = { expiresIn };
    return jsonwebtoken_1.default.sign(payload, secret, options);
};
const createSendToken = (user, statusCode, res) => {
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
const register = async (req, res) => {
    try {
        const { name, email, password, role, avatar, bio } = req.body;
        const user = await User_1.default.create({
            name,
            email,
            password,
            role,
            avatar,
            bio,
        });
        createSendToken(user, 201, res);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email e senha são obrigatórios'
            });
        }
        const user = await User_1.default.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                success: false,
                message: 'Credenciais inválidas'
            });
        }
        createSendToken(user, 200, res);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user?._id);
        res.status(200).json({
            success: true,
            data: { user }
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
exports.getMe = getMe;
