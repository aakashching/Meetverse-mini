const path = require("path");
const cors = require("cors")
const express = require("express");
module.exports = (app) => {
  app.use(express.static(path.join(__dirname, "..", "public")));
  app.use(express.static(path.join(__dirname, "..", "node_modules")));
  app.use(cors())
};
