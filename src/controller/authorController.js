const jwt = require("jsonwebtoken");
const authorModel = require("../models/authorModel");
const validator = require("../utils/validator");
//Creating Author documents by validating the details.
const createAuthor = async function (req, res) {
  try {
    // Request body verifying
    let requestBody = req.body;

    if (!validator.isValidRequestBody(requestBody)) {
      return res.status(400).send({
        status: false,
        message: "Invalid request parameter, please provide author Detaills",
      });
    }

    //Extract body params
    const { fname, lname, title, email, password } = requestBody;

    // Validation started & detecting here the falsy values .
    if (!validator.isValid(fname)) {
      return res.status(400).send({
        status: false,
        message: "First name is required,First letter must be capital.",
      });
    }
    if (!validator.isValid(lname)) {
      return res.status(400).send({
        status: false,
        message: "Last name is required,First letter must be capital.",
      });
    }
    if (!validator.isValid(title)) {
      return res
        .status(400)
        .send({ status: false, message: "Title is required" });
    }
    if (!validator.isValidTitle(title)) {
      return res.status(400).send({
        status: false,
        message: `Title should be among Mr, Mrs and Miss`,
      });
    }
    //Email validation whether it is entered perfectly or not.
    if (!validator.isValidEmail(email)) {
      res.status(400).send({
        status: false,
        message: `Email should be a valid email address`,
      });
      return;
    }

    if (!validator.isValidPassword(password)) {
      return res.status(400).send({
        status: false,
        message: `Password is required, Please enter At least one upper case,  one lower case English letter, one digit,  one special character and minimum eight in length
        `,
      });
    }
    const isEmailAlredyUsed = await authorModel.findOne({ email: email });
    if (isEmailAlredyUsed) {
      return res.status(400).send({
        status: false,
        message: `${email} email address is already registered`,
      });
    }
    //validation Ends
    //author created
    const newAuthor = await authorModel.create(requestBody);
    res.status(201).send({
      status: true,
      message: `Author created successfully`,
      data: newAuthor,
    });
  } catch (error) {
    res.status(500).send({ status: false, Error: error.message });
  }
};

const loginAuthor = async function (req, res) {
  try {
    const requestBody = req.body;
    if (!validator.isValidRequestBody(requestBody)) {
      return res.status(400).send({
        status: false,
        message: "Invalid request parameters. Please provide login details",
      });
    }
    //Extract from params
    let { email, password } = requestBody;
    if (!validator.isValidEmail(email)) {
      res.status(400).send({
        status: false,
        message: `Email is mandatory and provide valid email address`,
      });
      return;
    }
    if (!validator.isValidPassword(password)) {
      return res.status(400).send({
        status: false,
        message: `Password is required, Please enter At least one upper case,  one lower case English letter, one digit,  one special character and minimum eight in length`,
      });
    }
    let validAuthorId = await authorModel
      .findOne(requestBody)
      .select({ _id: 1 });
    if (!validAuthorId) {
      return res.status(404).send({ msg: "invalid email or password" });
    }
    //creating Jwt
    let token = jwt.sign(
      {
        authorId: validAuthorId._id,
      },
      "secretkey"
    );
    res.status(200).send({
      status: true,
      message: "Author login successfully",
      data: { token: token },
    });
  } catch (error) {
    res.status(500).send({ status: false, Error: error.message });
  }
};

module.exports = { createAuthor, loginAuthor };
