// Import necessary modules
const express = require("express");
require("dotenv").config();
const path = require("path");
const axios = require("axios");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { kruskal, approximateTSP } = require("./algo");
const { streamAIResponse, getProviderInfo } = require("./aiProviders");

// Initialize express app
const app = express();
const port = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
      imgSrc: ["'self'", "data:", "https://*.tile.openstreetmap.org"],
      connectSrc: ["'self'", "https://router.project-osrm.org"],
    },
  },
}));
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// Middleware
app.use(express.json({ limit: "10kb" })); // Limit body size
app.use(express.static("./public"));

/**
 * Route to optimize travel route based on user input
 * @route POST /optimize-route
 */
app.post("/optimize-route", async (req, res) => {
  try {
    const { text } = req.body;

    // Input validation
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({
        error: "Invalid input. Please provide a valid text string."
      });
    }

    if (text.length > 500) {
      return res.status(400).json({
        error: "Input too long. Please limit your input to 500 characters."
      });
    }

    console.log("Received text:", text);

    // Extract cities from text using AI or fallback
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

/**
 * Route for streaming AI responses using Server-Sent Events
 * @route GET /stream
 */
app.get("/stream", (req, res) => {
  // Setup headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable buffering in nginx

  const sendEventStreamData = (data) => {
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  };

  // Get route from query parameter
  const route = req.query.route || "bengalore to mumbai to daman to delhi";

  try {
    streamResponse(route, sendEventStreamData);
  } catch (error) {
    console.error("Stream error:", error.message);
    sendEventStreamData({ error: "Failed to stream response" });
  }

  req.on("close", () => {
    console.log("SSE connection closed");
    res.end();
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Provider info endpoint
app.get("/api/provider-info", (req, res) => {
  const providerInfo = getProviderInfo();
  res.json(providerInfo);
});

// Catch-all for undefined routes
app.all("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: "The requested endpoint does not exist"
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong"
  });
});

// Start the server
app.listen(port, () => {
  const providerInfo = getProviderInfo();
  console.log(`✅ Server is running on http://localhost:${port}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🤖 AI Provider: ${providerInfo.provider}`);
  console.log(`📦 Model: ${providerInfo.model || "N/A"}`);
  if (!providerInfo.configured) {
    console.warn(`⚠️  Warning: AI provider '${providerInfo.provider}' is not properly configured!`);
  }
});

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Extract cities from natural language text using AI
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

/**
 * Streams AI response from the configured provider to the client
 * @param {string} text - User input text
 * @param {Function} sendDataCallback - Callback to send data chunks
 */
async function streamResponse(text, sendDataCallback) {
  if (typeof sendDataCallback !== "function") {
    throw new TypeError("sendDataCallback must be a function");
  }

  const userMessage = `I want to go on a road trip to ${text}. Suggest some places I can visit along the way. Keep your response under 200 words.`;

  // Callbacks for the AI provider
  const onChunk = (content) => {
    sendDataCallback({
      message: { content },
      done: false,
    });
  };

  const onError = (error) => {
    console.error("AI Provider error:", error.message);
    sendDataCallback({
      error: error.message || "Failed to get AI response",
    });
  };

  const onComplete = () => {
    console.log("AI stream completed successfully");
    sendDataCallback({
      message: { content: "" },
      done: true,
    });
  };

  try {
    await streamAIResponse(userMessage, onChunk, onError, onComplete);
  } catch (error) {
    console.error("Stream response error:", error.message);
    onError(error);
  }
}
