import Post from '../models/Post.js';

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {
            query = {
                $or: [
                    { content: { $regex: search, $options: 'i' } },
                    { tags: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const posts = await Post.find(query).sort({ createdAt: -1 }).populate('author', 'name avatar role');
        res.status(200).json({ success: true, count: posts.length, data: posts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

// @desc    Get all posts
// ... (keep getPosts as is)

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res) => {
    try {
        let imageUrl = req.body.image; // Allow regular URL if passed

        if (req.file) {
            // Upload logic similar to uploadController
            const streamUpload = (req) => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'Krishi_Sanchay_Posts',
                        },
                        (error, result) => {
                            if (result) {
                                resolve(result);
                            } else {
                                reject(error);
                            }
                        }
                    );
                    streamifier.createReadStream(req.file.buffer).pipe(stream);
                });
            };

            const result = await streamUpload(req);
            imageUrl = result.secure_url;
        }

        const newPost = new Post({
            content: req.body.content,
            image: imageUrl,
            tags: req.body.tags || [],
            author: req.user.id
        });

        const post = await newPost.save();
        // Populate author details for immediate frontend display
        await post.populate('author', 'name avatar');

        res.status(201).json({ success: true, data: post });
    } catch (error) {
        console.error("Create Post Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Like a post
// @route   PUT /api/posts/like/:id
// @access  Private
export const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        // Check if the post has already been liked
        const index = post.likes.findIndex(like => like.toString() === req.user.id);

        if (index !== -1) {
            // Unlike
            post.likes.splice(index, 1);
        } else {
            // Like
            post.likes.unshift(req.user.id);
        }

        await post.save();

        res.status(200).json({ success: true, data: post.likes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Comment on a post
// @route   POST /api/posts/comment/:id
// @access  Private
export const commentOnPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        const newComment = {
            text: req.body.text,
            name: req.user.name,
            avatar: req.user.avatar,
            user: req.user.id
        };

        post.comments.unshift(newComment);
        await post.save();

        res.status(200).json({ success: true, data: post.comments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        // Check if user is post author
        if (post.author.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'User not authorized' });
        }

        await post.deleteOne(); // or findByIdAndDelete

        res.status(200).json({ success: true, message: 'Post removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
