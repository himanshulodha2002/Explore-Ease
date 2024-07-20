// Import necessary modules
const express = require("express");
require("dotenv").config();
const path = require("path");
const axios = require("axios");

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
    // Assuming getCities, getDistances, and kruskal are defined elsewhere in app.js
    //const citiesStr = await getCities(text);
    //const distances = await getDistances(citiesStr);
    // const route = kruskal(citiesStr, distances);
    console.log("text");
    res.json({data});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to optimize route" });
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

// Utility functions (assuming these are defined and used within app.js)
// async function getCities(text) {
//   const postData = {
//     model: "getcity",
//     messages: [
//       {
//         role: "user",
//         content: text,
//       },
//     ],
//     stream: false,
//   };

//   try {
//     const response = await axios.post(
//       "http://localhost:11434/api/chat",
//       postData
//     );
//     const citiesStr = response.data.message.content;
//     console.log(citiesStr);

//     const cityArray = citiesStr.split(";").map((cityInfo) => {
//       const parts = cityInfo.split(",").map((part) => part.trim());
//       const city = parts[0];
//       const longitude = convertCoord(parts[1]);
//       const latitude = convertCoord(parts[2]);

//       return { city, longitude, latitude };
//     });

//     return cityArray;
//   } catch (error) {
//     console.error("Error:", error);

//     throw error;
//   }
// }

// async function getDistances(cities) {
//   //////////////////////////////////////////////// !
//   console.log(cities);
//   return;
// }

// function kruskal(cities, distances) {
//   // Implementation
// }

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


function getData(text) {
  const cities = text.split(" to ");
  return cities;
}

// function convertCoord(coord) {
//   const value = parseFloat(coord.match(/[\d\.]+/)[0]); // Extract numeric part
//   const direction = coord.trim().slice(-1); // Extract direction (E, W, N, S)
//   if (direction === 'W' || direction === 'S') {
//     return -value;
//   }
//   return value;
// }

