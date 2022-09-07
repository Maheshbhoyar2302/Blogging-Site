const blogModel = require("../models/blogModel");
const authorModel = require("../models/authorModel");
const mongoose = require("mongoose");
const moment = require("moment");
const validator = require("../utils/validator");

const allBlogs = async function (req, res) {
  try {
    let { authorId, category, tags, subcategory } = req.query;
    // console.log(tags);
    let query = {};
    if (authorId != null) query.authorId = authorId;
    if (category != null) query.category = category;
    if (tags != null) query.tags = tags;
    if (subcategory != null) query.subcategory = subcategory;

    let totalBlogs = await blogModel.find({
      isDeleted: false,
      isPublished: true,
    });

    if (totalBlogs.length === 0) {
      res
        .status(404)
        .send({ status: false, msg: "None of the Blogs are Published" });
    } else if (Object.keys(query).length === 0) {
      res.status(200).send({ status: true, msg: totalBlogs });
    } else {
      let finalFilter = await blogModel.find(query);
      res.status(200).send({ status: true, msg: finalFilter });
    }
  } catch (error) {
    res.status(500).send({ status: false, msg: "server error" });
  }
};

const updateBlog = async function (req, res) {
  try {
    let id = req.params.blogId;
    if (!mongoose.isValidObjectId(id)) {
      res.status(400).send({
        status: false,
        msg: "invalid blogid  ",
      });
    }
    let blog = await blogModel.findById(id);
    if (!blog || blog.isDeleted === true) {
      res.status(404).send({
        status: false,
        msg: "",
      });
    }
    if (req.body.title) blog.title = req.body.title;
    if (req.body.body) blog.body = req.body.body;
    if (req.body.tags.length > 0) blog.tags = [...blog.tags, ...req.body.tags];
    if (req.body.subcategory.length > 0)
      blog.subcategory = [...blog.subcategory, ...req.body.subcategory];
    blog.isPublished = true;
    blog.publishedAt = moment();
    let blog2 = await blogModel.findByIdAndUpdate({ _id: id }, blog, {
      new: true,
    });
    res.status(200).send({ status: true, msg: blog2 });
  } catch (err) {
    res.status(500).send({ msg: err.message });
  }
};

const createBlog = async function (req, res) {
  try {
    const requestBody = req.body;
    if (!validator.isValidRequestBody(requestBody)) {
      return res.status(400).send({
        status: false,
        message: "Invalid request parameters. Please provide blog details",
      });
    }

    //Extract params
    const { title, body, authorId, tags, category, subcategory, isPublished } =
      requestBody;

    // Validation starts
    if (!validator.isValid(title)) {
      return res
        .status(400)
        .send({ status: false, message: "Blog Title is required" });
    }
    if (!validator.isValid(body)) {
      return res
        .status(400)
        .send({ status: false, message: "Blog body is required" });
    }
    if (!validator.isValid(authorId)) {
      return res
        .status(400)
        .send({ status: false, message: "Author id is required" });
    }
    if (!validator.isValidObjectId(authorId)) {
      return res.status(400).send({
        status: false,
        message: `${authorId} is not a valid author id`,
      });
    }
    const findAuthor = await authorModel.findById(authorId);
    if (!findAuthor) {
      return res
        .status(400)
        .send({ status: false, message: `Author does not exists.` });
    }
    if (!validator.isValid(category)) {
      return res
        .status(400)
        .send({ status: false, message: "Blog category is required" });
    }
    //After validation blog created
    let created = await blogModel.create(requestBody);
    res.status(201).send({ msg: created });
  } catch (err) {
    res.status(500).send({ msg: err.message });
  }
};

//DELETE /blogs/:blogId - Mark is Deleted:true if the blogId exists and it is not deleted.
const deleteBlogById = async function (req, res) {
  try {
    let id = req.params.blogId;

    if (!validator.isValidObjectId(id)) {
      return res
        .status(400)
        .send({ status: false, message: `BlogId is invalid.` });
    }

    let Blog = await blogModel.findById(id);

    if (!Blog) {
      return res.status(404).send({ status: false, msg: "No such blog found" });
    }
    if (Blog.isDeleted == false) {
      let Update = await blogModel.findOneAndUpdate(
        { _id: id },
        { isDeleted: true, deletedAt: Date() },
        { new: true }
      );
      res.status(200).send({
        status: true,
        message: "successfully deleted blog",
      });
    } else {
      return res
        .status(404)
        .send({ status: false, msg: "Blog already deleted" });
    }
  } catch (err) {
    res.status(500).send({ status: false, Error: err.message });
  }
};

// DELETE /blogs?queryParams - delete blogs by using specific queries or filters.
// Delete blog documents by category, authorid, tag name, subcategory name, unpublished
const deleteBlogByQuery = async function (req, res) {
  try {
    const filterQuery = {
      isDeleted: false,
    };
    const queryParams = req.query;

    if (!validator.isValidRequestBody(queryParams)) {
      return res.status(400).send({
        status: false,
        message: "No query params received. Aborting delete operation",
      });
    }

    const { authorId, category, tags, subcategory, isPublished } = queryParams;

    if (
      validator.isValid(authorId) &&
      validator.isValidObjectId(authorId) &&
      authorId === req["x-api-key"].authorId
    ) {
      filterQuery["authorId"] = authorId;
    } else {
      filterQuery["authorId"] = req["x-api-key"].authorId;
    }
    if (validator.isValid(category)) {
      filterQuery["category"] = category;
    }
    if (validator.isValid(tags)) {
      filterQuery["tags"] = tags;
    }
    if (validator.isValid(subcategory)) {
      filterQuery["subcategory"] = subcategory;
    }
    if (isPublished === "true") {
      filterQuery.isPublished = true;
    }
    if (isPublished === "false") {
      filterQuery.isPublished = false;
    }

    //filtered blogs are marked isDeleted=true
    let deleted = await blogModel.updateMany(filterQuery, {
      isDeleted: true,
      deletedAt: Date(),
    });

    if (deleted.modifiedCount === 0)
      return res.status(404).send({ msg: "No document found.." });
    res.status(200).send({ msg: "Blogs deleted.." });
  } catch (err) {
    res.status(500).send({ msg: err.message });
  }
};
module.exports = {
  createBlog,
  updateBlog,
  allBlogs,
  deleteBlogById,
  deleteBlogByQuery,
};
