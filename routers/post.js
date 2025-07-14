import { Router } from "express";
import commentRouter from './comment.js'
import Post from "../models/postmodel.js";
import { isSameUserValidator, isUserValidator } from "../validators/postvalidator.js";
import User from "../models/usersmodel.js";


const router = Router();
/*const posts = [
    {id: 1, title: 'first post', content: 'this is my first post'},
    {id: 2, title: 'second post', content: 'this is my second post'},
    {id: 3, title: 'third post', content: 'this is my third post'},
    {id: 4, title: 'fourth post', content: 'this is my fourth post'},
]*/

router.use('/:postId/comments', commentRouter)

router.get('/:postId', async(req, res) => {
    const postId = parseInt(req.params.postId, 10); // make sure it's a number
    //const result = posts.find(post => post.id === postId);
    const result = await Post.findById(req.params.postId);

    if (result) {
        res.json(result);
    } else {
        res.status(404).json({ error: 'Post not found' });
    }
});

router.put('/:postId',isUserValidator, isSameUserValidator, async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      { title, content },
      { new: true }
    );

    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete('/:postId',isUserValidator, isSameUserValidator, async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.postId);
    await User.findByIdAndUpdate(req.user._id,{
      $pull:{
        posts: req.params.postId
      }
    })

    if (!deletedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', isUserValidator, async (req, res) => {
  const { title, content } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const createdPost = await Post.create({
    title,
    content,
    author: req.user._id
  })


  res.status(201).json(createdPost);

});


router.get('/', async (req, res) => {
  const { keyword, page = 1, pageSize = 10 } = req.query;

  const limit = parseInt(pageSize, 10);
  const skip = (parseInt(page, 10) - 1) * limit;

  const filter = keyword
    ? {
        $or: [
          { title: { $regex: keyword, $options: 'i' } },
          { content: { $regex: keyword, $options: 'i' } },
        ],
      }
    : {};

  const [posts, total] = await Promise.all([
    Post.find(filter).skip(skip).limit(limit),
    Post.countDocuments(filter),
  ]);

  res.json({
    posts,
    total,
    page: parseInt(page, 10),
    pageSize: limit,
  });
});


export default router