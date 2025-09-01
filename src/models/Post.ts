import mongoose, { Document, Schema, Model } from 'mongoose';
import { IUser } from './User';

interface ILike {
  user: mongoose.Types.ObjectId | IUser;
  createdAt: Date;
}

interface IComment {
  user: mongoose.Types.ObjectId | IUser;
  content: string;
  createdAt: Date;
}

export interface IPost extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: mongoose.Types.ObjectId | IUser;
  tags: string[];
  category: string;
  featuredImage: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt: Date;
  views: number;
  likes: ILike[];
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>({
  title: {
    type: String,
    required: [true, 'Título é obrigatório'],
    trim: true,
    maxlength: [200, 'Título não pode ter mais de 200 caracteres']
  },
  slug: {
    type: String,
    lowercase: true
  },
  content: {
    type: String,
    required: [true, 'Conteúdo é obrigatório']
  },
  excerpt: {
    type: String,
    maxlength: [300, 'Resumo não pode ter mais de 300 caracteres']
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  category: {
    type: String,
    required: [true, 'Categoria é obrigatória'],
    trim: true
  },
  featuredImage: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: {
    type: Date
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Comentário não pode ter mais de 1000 caracteres']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});


postSchema.pre('save', function(this: IPost, next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }

  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  next();
});

postSchema.index({ slug: 1 }, { unique: true });
postSchema.index({ author: 1 });
postSchema.index({ category: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ status: 1 });
postSchema.index({ slug: 1 }, { unique: true });

const Post: Model<IPost> = mongoose.model<IPost>('Post', postSchema);

export default Post;