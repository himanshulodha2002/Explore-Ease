// Import necessary modules
const express = require("express");
require("dotenv").config();
const path = require("path");
const axios = require("axios");
const { kruskal, approximateTSP } = require("./algo");

// Initialize express app
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static("./public"));

// Route to optimize route
app.post("/optimize-route", async (req, res) => {
  try {
    const text = req.body.text;
    console.log("Received text:", text);

    // Extract cities from text using Ollama
    const cities = await getCities(text);

    if (!cities || cities.length === 0) {
      return res.status(400).json({
        error: "Could not extract cities from input",
        fallback: true,
        route: []
      });
    }

    // Use Kruskal's algorithm to find optimal route
    const optimizedRoute = kruskal(cities);

    console.log(`Optimized route with ${optimizedRoute.route.length} cities`);
    console.log(`Total distance: ${optimizedRoute.totalDistance.toFixed(2)} km`);

    // Format response for frontend
    const response = {
      cities: optimizedRoute.cities,
      route: optimizedRoute.route,
      mst: optimizedRoute.mst,
      totalDistance: optimizedRoute.totalDistance,
      waypoints: optimizedRoute.route.map(city => ({
        latitude: city.latitude,
        longitude: city.longitude,
        city: city.city
      }))
    };

    res.json(response);
  } catch (error) {
    console.error("Error in optimize-route:", error);
    res.status(500).json({
      error: "Failed to optimize route",
      details: error.message
    });
  }
});

// Route for streaming responses
app.get("/stream", (req, res) => {
  // Setup headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendEventStreamData = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Assuming streamResponse is defined elsewhere in app.js
  const response = streamResponse("bengalore to mumbai to daman to delhi", sendEventStreamData);


  req.on("close", () => {
    console.log("Connection closed");
  });
});

// Catch-all for undefined routes
app.all("*", (req, res) => {
  res.status(404).send(`<h1>Error 404</h1><h4>Page not found</h4>`);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening at port ${port}`);
});

// Utility functions

/**
 * Extract cities from natural language text using Ollama
 * @param {string} text - User input text containing city names
 * @returns {Array} Array of city objects with coordinates
 */
async function getCities(text) {
  const postData = {
    model: "getcity",
    messages: [
      {
        role: "user",
        content: text,
      },
    ],
    stream: false,
  };

  try {
    const response = await axios.post(
      "http://localhost:11434/api/chat",
      postData
    );
    const citiesStr = response.data.message.content;
    console.log("Extracted cities:", citiesStr);

    // Parse the response format: "City, Longitude, Latitude; City2, Lon2, Lat2"
    const cityArray = citiesStr.split(";").map((cityInfo) => {
      const parts = cityInfo.split(",").map((part) => part.trim());
      const city = parts[0];
      const longitude = convertCoord(parts[1]);
      const latitude = convertCoord(parts[2]);

      return { city, longitude, latitude };
    });

    return cityArray;
  } catch (error) {
    console.error("Error extracting cities:", error.message);

    // Fallback: Try to parse simple city names manually
    return parseCitiesFallback(text);
  }
}

/**
 * Fallback function to parse cities when Ollama is not available
 * Uses common city coordinates as examples
 */
function parseCitiesFallback(text) {
  console.log("Using fallback city parser");

  // Common Indian cities with coordinates
  const cityDatabase = {
    'mumbai': { city: 'Mumbai', latitude: 19.0760, longitude: 72.8777 },
    'delhi': { city: 'Delhi', latitude: 28.6139, longitude: 77.2090 },
    'bangalore': { city: 'Bangalore', latitude: 12.9716, longitude: 77.5946 },
    'bengaluru': { city: 'Bengaluru', latitude: 12.9716, longitude: 77.5946 },
    'chennai': { city: 'Chennai', latitude: 13.0827, longitude: 80.2707 },
    'kolkata': { city: 'Kolkata', latitude: 22.5726, longitude: 88.3639 },
    'hyderabad': { city: 'Hyderabad', latitude: 17.3850, longitude: 78.4867 },
    'pune': { city: 'Pune', latitude: 18.5204, longitude: 73.8567 },
    'ahmedabad': { city: 'Ahmedabad', latitude: 23.0225, longitude: 72.5714 },
    'jaipur': { city: 'Jaipur', latitude: 26.9124, longitude: 75.7873 },
    'surat': { city: 'Surat', latitude: 21.1702, longitude: 72.8311 },
    'lucknow': { city: 'Lucknow', latitude: 26.8467, longitude: 80.9462 },
    'kanpur': { city: 'Kanpur', latitude: 26.4499, longitude: 80.3319 },
    'nagpur': { city: 'Nagpur', latitude: 21.1458, longitude: 79.0882 },
    'indore': { city: 'Indore', latitude: 22.7196, longitude: 75.8577 },
    'thane': { city: 'Thane', latitude: 19.2183, longitude: 72.9781 },
    'bhopal': { city: 'Bhopal', latitude: 23.2599, longitude: 77.4126 },
    'visakhapatnam': { city: 'Visakhapatnam', latitude: 17.6868, longitude: 83.2185 },
    'pimpri': { city: 'Pimpri-Chinchwad', latitude: 18.6298, longitude: 73.7997 },
    'patna': { city: 'Patna', latitude: 25.5941, longitude: 85.1376 },
    'vadodara': { city: 'Vadodara', latitude: 22.3072, longitude: 73.1812 },
    'ghaziabad': { city: 'Ghaziabad', latitude: 28.6692, longitude: 77.4538 },
    'ludhiana': { city: 'Ludhiana', latitude: 30.9010, longitude: 75.8573 },
    'agra': { city: 'Agra', latitude: 27.1767, longitude: 78.0081 },
    'nashik': { city: 'Nashik', latitude: 19.9975, longitude: 73.7898 },
    'daman': { city: 'Daman', latitude: 20.3974, longitude: 72.8328 },
    'goa': { city: 'Goa', latitude: 15.2993, longitude: 74.1240 },
  };

  const cities = [];
  const lowerText = text.toLowerCase();

  // Try to find cities in the text
  for (const [key, value] of Object.entries(cityDatabase)) {
    if (lowerText.includes(key)) {
      cities.push(value);
    }
  }

  return cities;
}

/**
 * Convert coordinate string to decimal degrees
 * Handles formats like "72.8777 E" or "19.0760 N"
 */
function convertCoord(coord) {
  if (!coord) return 0;

  // If already a number, return it
  if (typeof coord === 'number') return coord;

  const value = parseFloat(coord.match(/[\d\.\-]+/)?.[0] || 0);
  const direction = coord.trim().slice(-1).toUpperCase();

  if (direction === 'W' || direction === 'S') {
    return -value;
  }
  return value;
}

async function streamResponse(text, sendDataCallback) {
  let responseBody = '';
  // Type check for sendDataCallback
  if (typeof sendDataCallback !== "function") {
    console.error("sendDataCallback must be a function");
    return; // Exit the function if sendDataCallback is not a function
  }

  const postData = {
    model: "gemma2",
    messages: [
      {
        role: "user",
        content:
          "I want to go to a road trip to" +
          text +
          ". suggest me some places i can visit along the way. in under 200 words, its a response in a chatbox",
      },
    ],
    stream: true,
  };

  try {
    const response = await axios.post(
      "http://localhost:11434/api/chat",
      postData,
      {
        headers: {
          "Content-Type": "application/json",
        },
        responseType: "stream", // This tells axios to handle the response as a stream
      }
    );

    response.data.on("data", (chunk) => {
      const parsedChunk = JSON.parse(chunk);
      responseBody += chunk;
      sendDataCallback(parsedChunk);
    });

    response.data.on("end", () => {
      sendDataCallback(" "); // Consider changing this to a more meaningful end-of-stream signal if needed
      return responseBody;
    });
  } catch (error) {
    console.error("Error:", error);
    throw error; // Rethrow or handle error appropriately
  }
}


