// Import necessary modules
const express = require("express");
require("dotenv").config();
const path = require("path");
const axios = require("axios");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
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

    console.log("Processing route optimization for:", text);

    // TODO: Implement actual city extraction and route optimization
    // const cities = await getCities(text);
    // const distances = await getDistances(cities);
    // const route = kruskal(cities, distances);

    const data = getMockRouteData(text);
    res.json(data);
  } catch (error) {
    console.error("Route optimization error:", error.message);
    res.status(500).json({
      error: "Failed to optimize route. Please try again later."
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


/**
 * Returns mock route data for testing
 * TODO: Replace with actual city extraction and route optimization
 * @param {string} text - User input text
 * @returns {Array} Array of waypoint coordinates
 */
function getMockRouteData(text) {
  // Mock data - Current location will be updated by frontend geolocation
  return [
    { latitude: 0, longitude: 0 }, // Current location (placeholder)
    { latitude: 19.076, longitude: 72.8777 }, // Mumbai
    { latitude: 20.3974, longitude: 72.8328 }, // Daman
    { latitude: 28.6139, longitude: 77.2088 }  // Delhi
  ];
}

/**
 * Converts coordinate string to decimal degrees
 * @param {string} coord - Coordinate string (e.g., "72.8777E")
 * @returns {number} Decimal degrees
 */
function convertCoordinate(coord) {
  const match = coord.match(/[\d.]+/);
  if (!match) {
    throw new Error(`Invalid coordinate format: ${coord}`);
  }

  const value = parseFloat(match[0]);
  const direction = coord.trim().slice(-1).toUpperCase();

  if (direction === "W" || direction === "S") {
    return -value;
  }
  return value;
}
