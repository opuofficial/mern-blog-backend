const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

// @desc    Register new user
// @route   POST /auth/signup
// @access  Public
const registerUser = async (req, res, next) => {
  const { email, username, password, confirmPassword } = req.body;

  if (!email || !username) {
    const error = new Error("Email and username are required");
    error.status = 400;
    return next(error);
  }

  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    const error = new Error("Email address already in use");
    error.status = 409;
    return next(error);
  }

  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    const error = new Error("Username already in use");
    error.status = 409;
    return next(error);
  }

  if (password.length < 6) {
    const error = new Error("Password must be at least 6 characters long");
    error.status = 400;
    return next(error);
  }

  if (password !== confirmPassword) {
    const error = new Error("Passwords do not match");
    error.status = 400;
    return next(error);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    email,
    username,
    password: hashedPassword,
  });

  try {
    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { emailOrUsername, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) {
      const error = new Error("Invalid credentials");
      error.status = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      const error = new Error("Invalid credentials");
      error.status = 401;
      throw error;
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    res.json({
      token,
      id: user._id,
      username: user.username,
      profilePicture: user.profilePicture,
      bookmarks: user.bookmarks,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
};
