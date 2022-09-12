const mongoose = require("mongoose");

const isValidName = function (value) {
  if (
    typeof value === "string" &&
    value.length > 0 &&
    /^[A-Z]+[a-z]*$/.test(value)
  )
    return true;
  return false;
};
const isValid = function (value) {
  if (
    typeof value === "string" &&
    value.length > 0 &&
    /^[A-Za-z0-9]+[a-zA-Z0-9 .,]*$/.test(value)
  )
    return true;
  return false;
};
const isValidPassword = function (value) {
  if (
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/.test(value)
  )
    return true;
  return false;
};
const isValidEmail = function (value) {
  if (/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(value)) return true;
  return false;
};

const isValidTitle = function (title) {
  return ["Mr", "Mrs", "Miss"].includes(title);
};

const isValidRequestBody = function (requestBody) {
  return Object.keys(requestBody).length > 0;
};

const isValidObjectId = function (objectId) {
  return mongoose.isValidObjectId(objectId);
};

const isStringsArray = function (arr) {
  for (let i = 0; i < arr.length; i++) {
    if (typeof arr[i] !== "string" || arr[i].length === 0) return false;
  }
  return true;
};

module.exports = {
  isValid,
  isValidTitle,
  isValidRequestBody,
  isValidObjectId,
  isValidPassword,
  isValidEmail,
  isStringsArray,
  isValidName,
};

