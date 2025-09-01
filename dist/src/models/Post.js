"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const postSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
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
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User'
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
    comments: [{
            user: {
                type: mongoose_1.Schema.Types.ObjectId,
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
postSchema.pre('save', function (next) {
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
const Post = mongoose_1.default.model('Post', postSchema);
exports.default = Post;
