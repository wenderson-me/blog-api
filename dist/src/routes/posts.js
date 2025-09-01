"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const postController_1 = require("../controllers/postController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.route('/')
    .get(postController_1.getAllPosts)
    .post(auth_1.protect, postController_1.createPost);
router.route('/:id')
    .get(postController_1.getPost)
    .put(auth_1.protect, postController_1.updatePost)
    .delete(auth_1.protect, postController_1.deletePost);
router.put('/:id/like', auth_1.protect, postController_1.likePost);
router.post('/:id/comments', auth_1.protect, postController_1.addComment);
exports.default = router;
