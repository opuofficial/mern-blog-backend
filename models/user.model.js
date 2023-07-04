const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    default: "default.jpg",
  },
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  bookmarks: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  about: {
    type: String,
  },
  social: {
    twitter: {
      type: String,
    },
    github: {
      type: String,
    },
    linkedin: {
      type: String,
    },
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
