const User = require("../models/user.model");
const Post = require("../models/post.model");
const Topic = require("../models/topic.model");
const bcrypt = require("bcrypt");
const fs = require("fs");

const uploadMiddleware = require("../middlewares/upload.middleware");

// @desc   Get user profile information
// @route  GET /user/profile
// @access Private
const userProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId)
      .select("-password")
      .populate({
        path: "posts",
        populate: [
          {
            path: "topic",
            select: "name",
          },
          {
            path: "author",
            select: "username profilePicture",
          },
        ],
        select: "thumbnail title createdAt",
        options: {
          sort: { createdAt: -1 },
        },
      });

    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    const { username, about, profilePicture, social, posts } = user;

    const socialLinks = {
      twitter: social.twitter,
      github: social.github,
      linkedin: social.linkedin,
    };

    return res.status(200).json({
      username,
      about,
      profilePicture,
      socialLinks,
      posts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get user profile data for editing
 * @route GET /user/edit-profile
 * @access Private
 */
const getEditProfileData = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Update user profile
 * @route PUT /user/edit-profile
 * @access Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const updates = req.body;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    const upload = uploadMiddleware("profilePicture", "profile-pictures");
    upload(req, res, async (err) => {
      if (err) {
        return next(err);
      }

      const prevProfilePicture = user.profilePicture;
      if (req.file && prevProfilePicture !== "default.jpg") {
        try {
          fs.unlink("./public/profile-pictures/" + prevProfilePicture);
        } catch (err) {
          console.error(err);
        }
      }

      if (updates.about) {
        user.about = updates.about.trim() || user.about;
      }
      if (updates.social) {
        if (updates.social.twitter) {
          user.social.twitter =
            updates.social.twitter.trim() || user.social.twitter;
        }
        if (updates.social.github) {
          user.social.github =
            updates.social.github.trim() || user.social.github;
        }
        if (updates.social.linkedin) {
          user.social.linkedin =
            updates.social.linkedin.trim() || user.social.linkedin;
        }
      }
      if (req.file) {
        user.profilePicture = req.file.filename;
      }

      const updatedUser = await user.save();
      res.json(updatedUser);
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Upload the thumbnail for the post
 * @route POST /user/upload-thumbnail
 * @access Private
 */
const uploadThumbnail = (req, res) => {
  const upload = uploadMiddleware("thumbnail", "post-thumbnails");

  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: "Failed to upload thumbnail" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No thumbnail file provided" });
    }

    res.json({ filename: req.file.filename });
  });
};

/**
 * @desc Create a new post for the authenticated user
 * @route POST /user/create-post
 * @access Private
 */
const createPost = async (req, res, next) => {
  try {
    if (!req.body.title || req.body.title.trim() === "") {
      const err = new Error(
        "Bad Request: Title is required and cannot be empty"
      );
      err.status = 400;
      return next(err);
    }

    if (!req.body.content || req.body.content.trim() === "") {
      const err = new Error(
        "Bad Request: Content is required and cannot be empty"
      );
      err.status = 400;
      return next(err);
    }

    if (!req.body.topic || req.body.topic.trim() === "") {
      const err = new Error(
        "Bad Request: Topic is required and cannot be empty"
      );
      err.status = 400;
      return next(err);
    }

    const post = new Post({
      title: req.body.title.trim(),
      content: req.body.content.trim(),
      thumbnail: req.body.thumbnail,
      topic: req.body.topic.trim(),
      author: req.user.userId,
    });

    await post.save();

    await Topic.findByIdAndUpdate(req.body.topic, {
      $push: { posts: post._id },
    });

    await User.findByIdAndUpdate(req.user.userId, {
      $push: { posts: post._id },
    });

    res.status(201).json({ message: "Post created successfully", post });
  } catch (error) {
    console.error(error);
    const err = new Error("Server Error");
    err.status = 500;
    return next(err);
  }
};

// @desc Add or remove a bookmark for a post
// @route POST /user/bookmark/add-remove
const addRemoveBookmark = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const postId = req.body.postId;

    const user = await User.findById(userId);
    const isBookmarked = user.bookmarks.includes(postId);

    if (isBookmarked) {
      user.bookmarks.pull(postId);
      await user.save();
      res.status(200).json({ message: "Bookmark removed", bookmark: false });
    } else {
      user.bookmarks.push(postId);
      await user.save();
      res.status(200).json({ message: "Bookmark added", bookmark: true });
    }
  } catch (err) {
    next(err);
  }
};

// @desc Get all bookmarked posts for a user
// @route GET /user/bookmarks
const getBookmarkedPosts = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).populate({
      path: "bookmarks",
      populate: [
        {
          path: "topic",
          select: "name",
        },
        {
          path: "author",
          select: "username profilePicture",
        },
      ],
      select: "thumbnail title createdAt",
    });

    res.json(user.bookmarks);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Change user's password
 * @route PUT /user/change-password
 * @access Private
 */
const changePassword = async (req, res, next) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    const error = new Error("Please provide all required fields.");
    error.status = 400;
    return next(error);
  }

  if (newPassword.length < 6) {
    const error = new Error("New password must be at least 6 characters long");
    error.status = 400;
    return next(error);
  }

  if (newPassword !== confirmNewPassword) {
    const error = new Error(
      "New password and confirm new password do not match"
    );
    error.status = 400;
    return next(error);
  }

  try {
    const user = await User.findById(req.user.userId);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      const error = new Error("Current password is incorrect");
      error.status = 400;
      return next(error);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(req.user.userId, { password: hashedPassword });

    res.status(200).json({ message: "Password successfully changed" });
  } catch (error) {
    console.error(error);
    const err = new Error("Server error");
    err.status = 500;
    return next(err);
  }
};

module.exports = {
  userProfile,
  getEditProfileData,
  updateProfile,
  uploadThumbnail,
  createPost,
  addRemoveBookmark,
  getBookmarkedPosts,
  changePassword,
};
