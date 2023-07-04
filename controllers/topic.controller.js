const Topic = require("../models/topic.model");
const Post = require("../models/post.model");

// @desc    Get all topics
// @route   GET /topics
const getAllTopics = async (req, res) => {
  try {
    const topics = await Topic.find();
    res.json(topics);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server Error: Could not retrieve topics." });
  }
};

/**
 * @desc Get all posts by topic
 * @route GET /topics/:topicId/posts
 */
const getPostsByTopic = async (req, res, next) => {
  try {
    const topicId = req.params.topicId;

    const topic = await Topic.findById(topicId);

    if (!topic) {
      const err = new Error("Topic not found");
      err.status = 404;
      return next(err);
    }

    const posts = await Post.find({ topic: topicId })
      .populate({
        path: "topic",
        select: "name",
      })
      .populate({
        path: "author",
        select: "username profilePicture",
      })
      .select("thumbnail title createdAt");

    res.status(200).json({ topic, posts });
  } catch (error) {
    console.error(error);
    const err = new Error("Server Error");
    err.status = 500;
    return next(err);
  }
};

module.exports = {
  getAllTopics,
  getPostsByTopic,
};
