const blogModel = require("../models/blogModel");
const jwt = require("jsonwebtoken");

const Authentication = async function (req, res, next) {
  ///write your code
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
          res.status(400).send({ msg: "invalid token" });
        } else {
          req["x-api-key"] = decodedToken1;
          next();
        }
      }
    );
  } catch (error) {
    res.status(500).send({ msg: error.message });
  }
};

const Authorisation = async function (req, res, next) {
  try {
    let decodedToken = req["x-api-key"];
    let blogId = req.params.blogId;
    let blog = await blogModel.findById(blogId);
    // console.log(decodedToken, blog);
    if (!blog)
      return res.status(404).send({ msg: "Requested blog not found.." });
    if (decodedToken.authorId !== blog.authorId.toString())
      res.status(403).send({ msg: " Not authorised .." });
    next();
  } catch (err) {
    res.status(500).send({ msg: err.message });
  }
};

module.exports = {
  Authentication,
  Authorisation,
};
