import { Router } from "express";
import Comment from "../models/commentmodel.js";
import Post from "../models/postmodel.js";

const router = Router({ mergeParams: true });

/**
 * GET /posts/:postId/comments
 * Get all comments for a specific post
 */
router.get('/', async (req, res) => {
  try {
    const { postId } = req.params;
    /*const comments = await Comment.find({ post: postId });
    res.json(comments);*/
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const comments = await Comment.find({ post: postId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    const total = await Comment.countDocuments({ post: postId });

    res.json({ comments, total, page });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /posts/:postId/comments
 * Create a new comment for a post
 */
router.post('/', async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = await Comment.create({ content, post: postId });

    // Optional: push comment reference to post.comments array
    post.comments.push(comment._id);
    await post.save();

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /posts/:postId/comments/:commentId
 * Update a comment
 */
router.put('/:commentId', async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  try {
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { content },
      { new: true }
    );

    if (!updatedComment) return res.status(404).json({ error: 'Comment not found' });

    res.json(updatedComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /posts/:postId/comments/:commentId
 * Delete a comment
 */
router.delete('/:commentId', async (req, res) => {
  const { commentId, postId } = req.params;

  try {
    const deleted = await Comment.findByIdAndDelete(commentId);

    if (!deleted) return res.status(404).json({ error: 'Comment not found' });

    // Optional: remove from post.comments array
    await Post.findByIdAndUpdate(postId, {
      $pull: { comments: commentId }
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
