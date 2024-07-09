const express = require("express");
require("dotenv").config();
const path = require("path");

const app = express();
const port = process.env.PORT || 5000;

app.use(express.static("./public"));

app.all("*", (req, res) => {
  res.status(404).send(`<h1>Error 404</h1><h4>Page not found</h4>`);
});

app.listen(port, () => {
  console.log(`Server is listening at port ${port}`);
});
