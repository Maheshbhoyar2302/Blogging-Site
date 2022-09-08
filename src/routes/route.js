const express = require("express");
const router = express.Router();
const authorController = require("../controller/authorController");
const blogController = require("../controller/blogController");
const auth = require("../middlewares/auth");

router.get("/test-me", function (req, res) {
  res.send("My first ever api!");
});

//author api
router.post("/authors", authorController.createAuthor);

//login
router.post("/login", authorController.loginAuthor);
//Blog api
router.post("/blogs", auth.Authentication, blogController.createBlog);
router.get("/blogs", auth.Authentication, blogController.getBlogs);
router.put(
  "/blogs/:blogId",
  auth.Authentication,
  auth.Authorisation,
  blogController.updateBlog
);
router.delete(
  "/blogs/:blogId",
  auth.Authentication,
  auth.Authorisation,
  blogController.deleteBlogById
);
router.delete("/blogs", auth.Authentication, blogController.deleteBlogByQuery);

module.exports = router;
