const blogModel = require("../models/blogModel");
const authorModel = require("../models/authorModel");
const mongoose = require("mongoose");
const moment = require("moment");
const validator = require("../utils/validator");

const createBlog = async function (req, res) {
  try {
    const requestBody = req.body;
    if (!validator.isValidRequestBody(requestBody)) {
      return res.status(400).send({
        status: false,
        message: "Invalid request parameters. Please provide blog details",
      });
    }
    let decodedToken = req["x-api-key"];
    //Extract params
    const { title, body, authorId, tags, category, subcategory, isPublished } =
      requestBody;

    if (decodedToken.authorId !== authorId.toString())
      return res.status(403).send({ msg: " Not authorised .." });

    // Validation starts
    if (!validator.isValid(title)) {
      return res.status(400).send({
        status: false,
        message: "Blog Title is required,only alphbets allowed.",
      });
    }
    if (!validator.isValid(body)) {
      return res.status(400).send({
        status: false,
        message: "Blog body is required,only alphbets allowed.",
      });
    }

    if (!validator.isValidObjectId(authorId)) {
      return res.status(400).send({
        status: false,
        message: `${authorId} is not a valid author id,Author id is required`,
      });
    }
    const findAuthor = await authorModel.findById(authorId);
    if (!findAuthor) {
      return res
        .status(400)
        .send({ status: false, message: `Author does not exists.` });
    }
    if (!validator.isValid(category)) {
      return res.status(400).send({
        status: false,
        message: "Blog category is required,only alphbets allowed.",
      });
    }
    if (!validator.isStringsArray(tags)) {
      return res.status(400).send({
        status: false,
        message: "Blog tags is required and it is an array of strings.",
      });
    }
    if (!validator.isStringsArray(subcategory)) {
      return res.status(400).send({
        status: false,
        message: "Blog subcategory is required and it is an array of strings.",
      });
    }
    //After validation blog created
    let created = await blogModel.create(requestBody);
    res.status(201).send({ msg: created });
  } catch (err) {
    res.status(500).send({ msg: err.message });
  }
};

const getBlogs = async function (req, res) {
  try {
    let { authorId, category, tags, subcategory } = req.query;
    console.log(authorId);
    let query = {};
    if (authorId) {
      if (!validator.isValidObjectId(authorId)) {
        return res.status(403).send({ msg: " invalid authorId.." });
      } else {
        query.authorId = authorId;
      }
    }
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
    res.status(500).send({ status: false, msg: error.message });
  }
};

const updateBlog = async function (req, res) {
  try {
    let id = req.params.blogId;
    let blog = await blogModel.findById(id);
    if (!blog || blog.isDeleted === true) {
      res.status(404).send({
        status: false,
        msg: "Blog not found..",
      });
    }
    const requestBody = req.body;
    if (!validator.isValidRequestBody(requestBody)) {
      return res.status(400).send({
        status: false,
        message: " Please provide updation details in body",
      });
    }
    if (req.body.title) {
      if (validator.isValid(req.body.title)) {
        blog.title = req.body.title;
      } else {
        return res.status(400).send({
          status: false,
          message: "Only alphbets allowed.",
        });
      }
    }
    if (req.body.body) {
      if (validator.isValid(req.body.body)) {
        blog.body = req.body.body;
      } else {
        return res.status(400).send({
          status: false,
          message: "Only alphbets allowed.",
        });
      }
    }
    if (req.body.tags) {
      if (validator.isStringsArray(req.body.tags))
        blog.tags = [...blog.tags, ...req.body.tags];
    }
    if (req.body.subcategory) {
      if (validator.isStringsArray(req.body.subcategory))
        blog.subcategory = [...blog.subcategory, ...req.body.subcategory];
    }
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
      validator.isValidObjectId(authorId) &&
      authorId === req["x-api-key"].authorId
    ) {
      filterQuery["authorId"] = req["x-api-key"].authorId;
    } else {
      return res.status(401).send({
        msg: `You are not authorized to delete blogs of this authorId=${authorId}`,
      });
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

    if (deleted.modifiedCount === 0) {
      return res.status(404).send({ msg: "No document found.." });
    } else {
      res.status(200).send({ msg: "Blogs deleted.." });
    }
  } catch (err) {
    res.status(500).send({ msg: err.message });
  }
};
module.exports = {
  createBlog,
  updateBlog,
  getBlogs,
  deleteBlogById,
  deleteBlogByQuery,
};
