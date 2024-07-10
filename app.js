const express = require("express");
require("dotenv").config();
const path = require("path");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static("./public"));

app.post("/optimize-route", async (req, res) => {
  const { text: text } = req.body;
  //console.log(text);
  try {
    const cities = await getCities(text);

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
  return "delhi,77.2150,28.6439 mumbai,72.8333,19.0760 chennai,80.2707,13.0827 "; // comment this line to use api
  // const postData = {
  //   model: "gemma2",
  //   messages: [
  //     {
  //       role: "user",
  //       content:
  //         text + // "give me the list of cities mentioned",
  //         "give me the list of cities mentioned, with there longitude latitude. in the format of <city,longitude,latitude> only no extra text",
  //     },
  //   ],
  //   stream: false,
  // };

  // try {
  //   const response = await axios.post(
  //     "http://localhost:11434/api/chat",
  //     postData
  //   );
  //   return response.data.message.content;
  // } catch (error) {
  //   console.error("Error:", error);
  //   throw error;
  // }
}
async function getDistances(cities) {
  //////////////////////////////////////////////// !
  console.log(cities);
}

function kruskal(cities, distances) {
  ////////////////////////////////////////////////// !
}
