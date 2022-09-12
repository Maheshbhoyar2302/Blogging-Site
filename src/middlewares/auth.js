const blogModel = require("../models/blogModel");
const jwt = require("jsonwebtoken");
const validator = require("../utils/validator");

const Authentication = async function (req, res, next) {
  try {
    let token = req.headers["x-api-key"];
    if (!token) {
      return res.send({ msg: "Error : enter a token" });
    }
    let decodedToken = jwt.verify(
      token,
      "secretkey",
      function (err, decodedToken1) {
        if (err) {
          return res.status(401).send({ msg: "invalid token" });
        } else {
          req["x-api-key"] = decodedToken1;
          next();
        }
      }
    );
  } catch (error) {
    return res.status(500).send({ msg: error.message });
  }
};

const Authorisation = async function (req, res, next) {
  try {
    let decodedToken = req["x-api-key"];
    //blog id validation

    let blogId = req.params.blogId;
    if (!validator.isValidObjectId(blogId)) {
      return res.status(403).send({ msg: " invalid blogId.." });
    }
    let blog = await blogModel.findOne({ _id: blogId });

    if (!blog)
      return res.status(404).send({ msg: "Requested blog not found.." });
    if (decodedToken.authorId !== blog.authorId.toString()) {
      return res.status(403).send({ msg: " Not authorised .." });
    } else {
      next();
    }
  } catch (err) {
    return res.status(500).send({ msg: err.message });
  }
};

module.exports = {
  Authentication,
  Authorisation,
};
