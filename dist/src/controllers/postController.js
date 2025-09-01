"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addComment = exports.likePost = exports.deletePost = exports.updatePost = exports.createPost = exports.getPost = exports.getAllPosts = void 0;
const Post_1 = __importDefault(require("../models/Post"));
const getAllPosts = async (req, res) => {
    try {
        const queryObj = { ...req.query };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        let query = Post_1.default.find(JSON.parse(queryStr));
        query = query.populate('author', 'name email avatar');
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        }
        else {
            query = query.sort('-createdAt');
        }
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Post_1.default.countDocuments(JSON.parse(queryStr));
        query = query.skip(startIndex).limit(limit);
        const posts = await query;
        const pagination = {};
        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            };
        }
        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            };
        }
        res.status(200).json({
            success: true,
            count: posts.length,
            total,
            pagination,
            data: posts
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
exports.getAllPosts = getAllPosts;
const getPost = async (req, res) => {
    try {
        const post = await Post_1.default.findById(req.params.id)
            .populate('author', 'name email avatar')
            .populate('comments.user', 'name avatar');
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post não encontrado'
            });
        }
        post.views += 1;
        await post.save({ validateBeforeSave: false });
        res.status(200).json({
            success: true,
            data: post
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
exports.getPost = getPost;
const createPost = async (req, res) => {
    try {
        req.body.author = req.user?._id;
        const post = await Post_1.default.create(req.body);
        res.status(201).json({
            success: true,
            data: post
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
exports.createPost = createPost;
const updatePost = async (req, res) => {
    try {
        let post = await Post_1.default.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post não encontrado'
            });
        }
        if (post.author.toString() !== req.user?._id && req.user?.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Não autorizado a atualizar este post'
            });
        }
        post = await Post_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({
            success: true,
            data: post
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
exports.updatePost = updatePost;
const deletePost = async (req, res) => {
    try {
        const post = await Post_1.default.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post não encontrado'
            });
        }
        if (post.author.toString() !== req.user?._id && req.user?.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Não autorizado a deletar este post'
            });
        }
        await post.deleteOne();
        res.status(200).json({
            success: true,
            data: {}
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
exports.deletePost = deletePost;
const likePost = async (req, res) => {
    try {
        const post = await Post_1.default.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post não encontrado'
            });
        }
        const alreadyLiked = post.likes.find(like => like.user.toString() === req.user?._id?.toString());
        if (alreadyLiked) {
            post.likes = post.likes.filter(like => like.user.toString() !== req.user?._id?.toString());
        }
        else {
            post.likes.push({
                user: req.user?._id,
                createdAt: new Date()
            });
        }
        await post.save();
        res.status(200).json({
            success: true,
            data: post
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
exports.likePost = likePost;
const addComment = async (req, res) => {
    try {
        const post = await Post_1.default.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post não encontrado'
            });
        }
        const newComment = {
            user: req.user?._id,
            content: req.body.content,
            createdAt: new Date()
        };
        post.comments.push(newComment);
        await post.save();
        res.status(201).json({
            success: true,
            data: post
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
exports.addComment = addComment;
