const express = require("express");
const router = express.Router();

const { getAuthor } = require("../controllers/author.controller");

router.get("/:username", getAuthor);

module.exports = router;
