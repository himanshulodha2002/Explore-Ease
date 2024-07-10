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
    const citiesStr = await getCities(text);

    const distances = await getDistances(citiesStr);
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
  return [
    { city: 'Delhi', longitude: 77.209, latitude: 28.6555 },
    { city: 'London', longitude: 0.1278, latitude: 51.5074 },
    { city: 'Chennai', longitude: 10, latitude: 13.12 }
  ];
  // const postData = {
  //   model: "getcity",
  //   messages: [
  //     {
  //       role: "user",
  //       content:
  //         text
  //     },
  //   ],
  //   stream: false,
  // };

  // try {
  //   const response = await axios.post(
  //     "http://localhost:11434/api/chat",
  //     postData
  //   );
  //   const citiesStr = response.data.message.content;
  //   console.log(citiesStr);
    
  //   const cityArray = citiesStr.split(';').map(cityInfo => {
  //     const parts = cityInfo.split(',').map(part => part.trim());
  //     const city = parts[0];
  //     const longitude = convertCoord(parts[1]);
  //     const latitude = convertCoord(parts[2]);

  //     return { city, longitude, latitude };
  //   });

  //   return cityArray;
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

function convertCoord(coord) {
  const value = parseFloat(coord.match(/[\d\.]+/)[0]); // Extract numeric part
  const direction = coord.trim().slice(-1); // Extract direction (E, W, N, S)
  if (direction === 'W' || direction === 'S') {
    return -value;
  }
  return value;
}