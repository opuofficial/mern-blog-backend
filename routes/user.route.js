const express = require("express");
const router = express.Router();

const verifyToken = require("../middlewares/verifyToken.middleware");

const {
  userProfile,
  getEditProfileData,
  uploadProfilePicture,
  updateProfile,
  uploadThumbnail,
  createPost,
  addRemoveBookmark,
  getBookmarkedPosts,
  changePassword,
} = require("../controllers/user.controller");

router.get("/profile", verifyToken, userProfile);
router.get("/edit-profile", verifyToken, getEditProfileData);
router.put("/edit-profile", verifyToken, updateProfile);
router.put("/upload-profile-picture", verifyToken, uploadProfilePicture);
router.post("/upload-thumbnail", verifyToken, uploadThumbnail);
router.post("/create-post", verifyToken, createPost);
router.get("/bookmarks", verifyToken, getBookmarkedPosts);
router.post("/bookmark/add-remove", verifyToken, addRemoveBookmark);
router.put("/change-password", verifyToken, changePassword);

module.exports = router;
