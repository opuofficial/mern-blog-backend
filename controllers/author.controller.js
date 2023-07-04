const User = require("../models/user.model");

/**
 * @desc Get author details by username
 * @route GET /author/:username
 * @access Public
 */
const getAuthor = async (req, res, next) => {
  const { username } = req.params;

  try {
    const author = await User.findOne({ username }).populate({
      path: "posts",
      populate: [
        {
          path: "author",
          select: "username profilePicture",
        },
        {
          path: "topic",
          select: "name",
        },
      ],
    });

    if (!author) {
      const error = new Error("Author not found");
      error.status = 404;
      throw error;
    }

    const { _id, fullname, profilePicture, posts, about, social } = author;

    const totalPosts = posts.length;

    res.status(200).json({
      author: {
        _id,
        username,
        fullname,
        profilePicture,
        totalPosts,
        posts,
        about,
        social,
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { getAuthor };
