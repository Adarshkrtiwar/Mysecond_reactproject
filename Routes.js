'routes/userRoutes.js'

const express = require('express');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
}));

router.get('/profile', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
}));

router.put('/profile', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.bio = req.body.bio || user.bio;
    user.profilePicture = req.body.profilePicture || user.profilePicture;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      bio: updatedUser.bio,
      profilePicture: updatedUser.profilePicture,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
}));

module.exports = router;

'routes/postRoutes.js ' : 
const express = require('express');
const asyncHandler = require('express-async-handler');
const Post = require('../models/postModel');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', protect, asyncHandler(async (req, res) => {
  const { content, image } = req.body;

  const post = new Post({
    user: req.user._id,
    content,
    image,
  });

  const createdPost = await post.save();
  res.status(201).json(createdPost);
}));

router.get('/', protect, asyncHandler(async (req, res) => {
  const posts = await Post.find({}).populate('user', 'name profilePicture');
  res.json(posts);
}));

router.get('/:id', protect, asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate('user', 'name profilePicture');

  if (post) {
    res.json(post);
  } else {
    res.status(404);
    throw new Error('Post not found');
  }
}));

router.put('/:id', protect, asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (post) {
    post.content = req.body.content || post.content;
    post.image = req.body.image || post.image;

    const updatedPost = await post.save();
    res.json(updatedPost);
  } else {
    res.status(404);
    throw new Error('Post not found');
  }
}));

router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (post) {
    await post.remove();
    res.json({ message: 'Post removed' });
  } else {
    res.status(404);
    throw new Error('Post not found');
  }
}));

router.post('/:id/like', protect, asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (post) {
    if (post.likes.includes(req.user._id)) {
      post.likes = post.likes.filter(like => like.toString() !== req.user._id.toString());
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();
    res.json(post.likes);
  } else {
    res.status(404);
    throw new Error('Post not found');
  }
}));

router.post('/:id/comment', protect, asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (post) {
    const comment = {
      user: req.user._id,
      comment: req.body.comment,
    };

    post.comments.push(comment);
    await post.save();
    res.json(post.comments);
  } else {
    res.status(404);
    throw new Error('Post not found');
  }
}));

module.exports = router;

