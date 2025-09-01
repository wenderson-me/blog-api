import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Post, { IPost } from '../models/Post';

interface QueryParams {
  page?: string;
  sort?: string;
  limit?: string;
  fields?: string;
  [key: string]: any;
}

export const getAllPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const queryObj: QueryParams = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    let query = Post.find(JSON.parse(queryStr));

    query = query.populate('author', 'name email avatar');

    if (req.query.sort) {
      const sortBy = (req.query.sort as string).split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Post.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    const posts = await query;

    const pagination: { next?: { page: number; limit: number }; prev?: { page: number; limit: number } } = {};

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
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getPost = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const post = await Post.findById(req.params.id)
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
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    req.body.author = req.user?._id;

    const post = await Post.create(req.body);

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const updatePost = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    let post = await Post.findById(req.params.id);

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

    post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deletePost = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const post = await Post.findById(req.params.id);

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
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const likePost = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post não encontrado'
      });
    }

    const alreadyLiked = post.likes.find(like =>
      like.user.toString() === req.user?._id?.toString()
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter(like =>
        like.user.toString() !== req.user?._id?.toString()
      );
    } else {
      post.likes.push({ 
        user: req.user?._id as mongoose.Types.ObjectId, 
        createdAt: new Date() 
      });
    }

    await post.save();

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const addComment = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post não encontrado'
      });
    }

    const newComment = {
      user: req.user?._id as mongoose.Types.ObjectId,
      content: req.body.content,
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};