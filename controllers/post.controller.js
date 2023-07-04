const Post = require("../models/post.model");
const Topic = require("../models/topic.model");

// @desc    Get all posts
// @route   GET /posts
const getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "topic",
        select: "name",
      })
      .populate({
        path: "author",
        select: "username profilePicture",
      })
      .select("thumbnail title createdAt");

    res.json(posts);
  } catch (err) {
    next(err);
  }
};

// @desc    Get a single post by postId
// @route   GET /posts/:postId
const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate({
        path: "author",
        select: "id username profilePicture about social",
      })
      .populate({
        path: "topic",
        select: "name",
      });

    if (!post) {
      const error = new Error("Post not found");
      error.statusCode = 404;
      throw error;
    }

    res.json(post);

    await Post.findByIdAndUpdate(req.params.postId, { $inc: { views: 1 } });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Like a post
 * @route PUT /posts/:postId/like
 * @access Private
 */
const likePost = async (req, res, next) => {
  const { postId } = req.params;
  const { userId } = req.user;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error("Post not found");
      error.status = 404;
      throw error;
    }

    const likedIndex = post.likes.indexOf(userId);
    const dislikedIndex = post.dislikes.indexOf(userId);

    if (likedIndex !== -1) {
      post.likes.splice(likedIndex, 1);
    } else if (dislikedIndex !== -1) {
      post.dislikes.splice(dislikedIndex, 1);
      post.likes.push(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    const likeAction = likedIndex !== -1 ? "unliked" : "liked";

    res.status(200).json({
      message: `Post ${likeAction} successfully`,
      totalLikes: post.likes.length,
      totalDislikes: post.dislikes.length,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

/**
 * @desc Dislike a post
 * @route PUT /posts/:postId/dislike
 * @access Private
 */
const dislikePost = async (req, res, next) => {
  const { postId } = req.params;
  const { userId } = req.user;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error("Post not found");
      error.status = 404;
      throw error;
    }

    const likedIndex = post.likes.indexOf(userId);
    const dislikedIndex = post.dislikes.indexOf(userId);

    if (dislikedIndex !== -1) {
      post.dislikes.splice(dislikedIndex, 1);
    } else if (likedIndex !== -1) {
      post.likes.splice(likedIndex, 1);
      post.dislikes.push(userId);
    } else {
      post.dislikes.push(userId);
    }

    await post.save();

    const dislikeAction = dislikedIndex !== -1 ? "undisliked" : "disliked";

    res.status(200).json({
      message: `Post ${dislikeAction} successfully`,
      totalLikes: post.likes.length,
      totalDislikes: post.dislikes.length,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

/**
 * @desc Delete a post
 * @route DELETE /posts/:postId/delete
 * @access Private
 */
const deletePost = async (req, res, next) => {
  try {
    const postId = req.params.postId;

    const post = await Post.findById(postId);

    if (!post) {
      const err = new Error("Post not found");
      err.status = 404;
      return next(err);
    }

    await Topic.findByIdAndUpdate(post.topic, {
      $pull: { posts: postId },
    });

    await Post.findByIdAndRemove(postId);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(error);
    const err = new Error("Server Error");
    err.status = 500;
    return next(err);
  }
};

/**
 * @desc Search posts by query
 * @route GET /posts/search?query=:searchString
 * @access Public
 */
const searchPosts = async (req, res, next) => {
  try {
    const { query } = req.query;

    const searchResults = await Post.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
      ],
    })
      .populate({
        path: "topic",
        select: "name",
      })
      .populate({
        path: "author",
        select: "username profilePicture",
      })
      .select("thumbnail title createdAt")
      .sort({ title: -1 });

    res.status(200).json({
      message: "Search results",
      results: searchResults,
    });
  } catch (error) {
    console.error(error);
    const err = new Error("Server Error");
    err.status = 500;
    return next(err);
  }
};

/**
 * @desc Get popular posts (based on likes, dislikes, and views)
 * @route GET /posts/popular
 */
const getPopularPosts = async (req, res, next) => {
  try {
    const popularPosts = await Post.aggregate([
      {
        $addFields: {
          likesCount: { $size: "$likes" },
          dislikesCount: { $size: "$dislikes" },
        },
      },
      {
        $sort: { likesCount: -1, dislikesCount: 1, views: -1 },
      },
      {
        $limit: 3,
      },
      {
        $project: {
          _id: 1,
          title: 1,
          thumbnail: 1,
          createdAt: 1,
        },
      },
    ]);

    res.status(200).json({ posts: popularPosts });
  } catch (error) {
    console.error(error);
    const err = new Error("Server Error");
    err.status = 500;
    return next(err);
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  likePost,
  dislikePost,
  deletePost,
  searchPosts,
  getPopularPosts,
};
