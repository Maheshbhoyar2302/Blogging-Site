const express = require("express");
const router = express.Router();
const authorController = require("../controller/authorController");
const blogController = require("../controller/blogController");

router.get("/test-me", function (req, res) {
  res.send("My first ever api!");
});

router.post("/authors", authorController.CreateAuthor);

router.post("/blogs", blogController.createBlog);

router.put("/blogs/:blogId", blogController.updateBlog);

module.exports = router;
