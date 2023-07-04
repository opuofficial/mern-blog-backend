const express = require("express");
const router = express.Router();

const verifyToken = require("../middlewares/verifyToken.middleware");

const {
  getAllPosts,
  getPostById,
  likePost,
  dislikePost,
  deletePost,
  searchPosts,
  getPopularPosts,
} = require("../controllers/post.controller");

router.get("/", getAllPosts);
router.get("/search", searchPosts);
router.get("/popular", getPopularPosts);
router.get("/:postId", getPostById);

router.put("/:postId/like", verifyToken, likePost);
router.put("/:postId/dislike", verifyToken, dislikePost);
router.delete("/:postId/delete", verifyToken, deletePost);

module.exports = router;
