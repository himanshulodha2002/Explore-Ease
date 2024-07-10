const express = require("express");
require("dotenv").config();
const path = require("path");
const axios = require("axios");
const ollama = require("ollama");

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static("./public"));

app.post("/optimize-route", async (req, res) => {
  const { text: text } = req.body;
  try {
    const cities = getCities(text);
    const distances = await getDistances(cities);
    const route = kruskal(cities, distances);
    res.json({ optimizedRoute: route }); /// and make it map to the map
  } catch (error) {
    res.status(500).json({ error: "Failed to optimize route" });
  }
});

app.all("*", (req, res) => {
  res.status(404).send(`<h1>Error 404</h1><h4>Page not found</h4>`);
});

app.listen(port, () => {
  console.log(`Server is listening at port ${port}`);
});

async function getCities(text) {
  ////////////////////////////////////////////////// !
}
async function getDistances(cities) {
  //////////////////////////////////////////////// !
}

function kruskal(cities, distances) {
  ////////////////////////////////////////////////// !
}
