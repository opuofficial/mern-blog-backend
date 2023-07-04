const express = require("express");
const router = express.Router();

const {
  getAllTopics,
  getPostsByTopic,
} = require("../controllers/topic.controller");

router.get("/", getAllTopics);
router.get("/:topicId/posts", getPostsByTopic);

module.exports = router;
