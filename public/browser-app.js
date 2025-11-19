/**
 * Submits user text input and initiates route optimization
 */
function submitText() {
  const inputElement = document.getElementById("inputText");
  const text = inputElement.value.trim();

  if (!text) {
    return; // Don't submit empty messages
  }

  const chatHistory = document.getElementById("chatHistory");

  // Create user message bubble
  const messageDiv = document.createElement("div");
  messageDiv.className = "chatBubbleUser";
  messageDiv.textContent = text;

  chatHistory.appendChild(messageDiv);
  chatHistory.scrollTop = chatHistory.scrollHeight;
  inputElement.value = "";

  initiateFetch(text);
}

/**
 * Initiates both AI streaming and route optimization
 * @param {string} text - User input text
 */
async function initiateFetch(text) {
  let loadingIndicator;

  try {
    // Start AI response stream
    const streamPromise = startEventStream(text);

    // Show loading indicator
    loadingIndicator = showLoading();

    // Wait for stream to complete
    await streamPromise;

    // Fetch route optimization data
    const response = await fetch("/optimize-route", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Hide loading indicator
    hideLoading();

    // Check if we got valid waypoints
    if (data.waypoints && data.waypoints.length > 0) {
      console.log(`Route optimized with ${data.waypoints.length} waypoints`);
      console.log(`Total distance: ${data.totalDistance?.toFixed(2) || 'N/A'} km`);

      // Display route on map
      await renderRoute(data.waypoints);

      // Show route info in chat
      if (data.totalDistance) {
        displayRouteInfo(data);
      }
    } else {
      console.error("No waypoints received");
      displayError("Could not find cities in your input. Please try again with city names.");
    }
  } catch (error) {
    console.error("Failed to fetch data:", error);
    hideLoading();
    displayError("Failed to optimize route. Please check your connection and try again.");
  }
}

/**
 * Display route optimization information in chat
 * @param {Object} data - Route data with cities, distance, etc.
 */
function displayRouteInfo(data) {
  const chatHistory = document.getElementById("chatHistory");
  const infoDiv = document.createElement("div");
  infoDiv.id = "routeInfo";

  let routeText = `🗺️ Route Optimized!\n\n`;
  routeText += `📍 Cities: ${data.route.length}\n`;
  routeText += `📏 Total Distance: ${data.totalDistance.toFixed(2)} km\n`;
  routeText += `⚡ Algorithm: Kruskal's MST\n\n`;
  routeText += `🛣️ Optimal Route:\n`;
  data.route.forEach((city, index) => {
    const emoji = index === 0 ? '🏁' : index === data.route.length - 1 ? '🎯' : '📍';
    routeText += `${emoji} ${index + 1}. ${city.city || 'Point ' + index}\n`;
  });

  infoDiv.textContent = routeText;
  infoDiv.style.whiteSpace = "pre-line";
  chatHistory.appendChild(infoDiv);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

/**
 * Display error message in chat
 * @param {string} message - Error message to display
 */
function displayError(message) {
  const chatHistory = document.getElementById("chatHistory");
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.textContent = `❌ ${message}`;
  chatHistory.appendChild(errorDiv);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

/**
 * Show loading indicator in chat
 * @returns {HTMLElement} The loading element
 */
function showLoading() {
  const chatHistory = document.getElementById("chatHistory");
  const loadingDiv = document.createElement("div");
  loadingDiv.className = "loading-dots";
  loadingDiv.id = "loadingIndicator";
  loadingDiv.textContent = "Optimizing route";
  chatHistory.appendChild(loadingDiv);
  chatHistory.scrollTop = chatHistory.scrollHeight;
  return loadingDiv;
}

/**
 * Hide loading indicator
 */
function hideLoading() {
  const loadingDiv = document.getElementById("loadingIndicator");
  if (loadingDiv) {
    loadingDiv.remove();
  }
}

/**
 * Sets up EventSource for streaming AI responses
 * @param {string} route - The route text for AI recommendations
 * @returns {Promise<EventSource>}
 */
function setupEventStream(route) {
  return new Promise((resolve, reject) => {
    const eventSource = new EventSource(`/stream?route=${encodeURIComponent(route)}`);
    const chatHistory = document.getElementById("chatHistory");
    const messageDiv = document.createElement("div");
    messageDiv.className = "chatBubbleAi";
    let hasAppended = false;

    eventSource.onopen = () => {
      console.log("EventStream opened");
      resolve(eventSource);
    };

    eventSource.onerror = (error) => {
      console.error("EventStream encountered an error:", error);
      eventSource.close();
      if (!hasAppended) {
        messageDiv.textContent = "Failed to get AI response. Please ensure your AI provider is configured correctly.";
        chatHistory.appendChild(messageDiv);
        hasAppended = true;
      }
      reject(error);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.error) {
          messageDiv.textContent = data.error;
          eventSource.close();
        } else if (data.message && data.message.content) {
          messageDiv.textContent += data.message.content;
        }

        if (!hasAppended) {
          chatHistory.appendChild(messageDiv);
          hasAppended = true;
        }
        chatHistory.scrollTop = chatHistory.scrollHeight;

        // Close stream when done
        if (data.done) {
          eventSource.close();
        }
      } catch (parseError) {
        console.error("Failed to parse event data:", parseError);
      }
    };
  });
}

/**
 * Starts the AI response event stream
 * @param {string} route - The route text for AI recommendations
 */
async function startEventStream(route) {
  try {
    const eventSource = await setupEventStream(route);
    console.log("EventStream is ready");
  } catch (error) {
    console.error("Failed to setup EventStream:", error);
  }
}

// Event listener for Enter key submission
document.getElementById("inputText").addEventListener("keypress", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    submitText();
  }
});

// ============================================================
// MAP INITIALIZATION
// ============================================================

const map = L.map("map").setView([20.5937, 78.9629], 5);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19,
}).addTo(map);

let currentMarker = null;
let currentCircle = null;
let locationUpdateInterval = null;

/**
 * Renders the route on the map with user's current location
 * @param {Array} waypoints - Array of waypoint coordinates
 */
async function renderRoute(waypoints) {
  if (!navigator.geolocation) {
    console.error("Geolocation is not supported by your browser.");
    displayError("Geolocation is not supported by your browser.");
    return;
  }

  /**
   * Gets current position as a Promise
   * @returns {Promise<GeolocationPosition>}
   */
  const getPositionAsync = () =>
    new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });
    });

  /**
   * Updates the user's location on the map and renders routes
   * @param {Array} waypoints - Array of waypoint coordinates
   */
  async function updateLocation(waypoints) {
    try {
      const position = await getPositionAsync();
      const { latitude: lat, longitude: long, accuracy } = position.coords;

      console.log(`Position: lat=${lat}, long=${long}, accuracy=${accuracy}m`);

      // Update waypoints with current location
      waypoints[0].latitude = lat;
      waypoints[0].longitude = long;

      // Remove existing marker and circle
      if (currentMarker) {
        map.removeLayer(currentMarker);
      }
      if (currentCircle) {
        map.removeLayer(currentCircle);
      }

      // Add new marker and accuracy circle
      currentMarker = L.marker([lat, long]).addTo(map);
      currentCircle = L.circle([lat, long], { radius: accuracy }).addTo(map);

      // Remove existing routes
      map.eachLayer((layer) => {
        if (layer instanceof L.Routing.Control) {
          map.removeLayer(layer);
        }
      });

      // Draw routes between consecutive waypoints
      waypoints.forEach((waypoint, index) => {
        if (index < waypoints.length - 1) {
          const routingControl = L.Routing.control({
            waypoints: [
              L.latLng(waypoint.latitude, waypoint.longitude),
              L.latLng(waypoints[index + 1].latitude, waypoints[index + 1].longitude),
            ],
            fitSelectedRoutes: false,
            show: false,
          }).addTo(map);
          routingControl.hide();
        }
      });
    } catch (error) {
      console.error("Failed to get position:", error);
      displayError("Failed to get your location. Please check your browser permissions.");
    }
  }

  // Clear any existing interval
  if (locationUpdateInterval) {
    clearInterval(locationUpdateInterval);
  }

  // Initial location update
  await updateLocation(waypoints);

  // Update location every 5 seconds
  locationUpdateInterval = setInterval(() => updateLocation(waypoints), 5000);

  // Hide the routing control interface
  if (!document.getElementById("hide-routing-controls")) {
    const style = document.createElement("style");
    style.id = "hide-routing-controls";
    style.textContent = ".leaflet-routing-container { display: none !important; }";
    document.head.appendChild(style);
  }
}

/**
 * Draws a polyline route on the map
 * @param {Array} cities - Array of city coordinates
 */
function drawRoute(cities) {
  const latlngs = cities.map((city) => [city.latitude, city.longitude]);
  const polyline = L.polyline(latlngs, { color: "red", weight: 3 }).addTo(map);
  map.fitBounds(polyline.getBounds());
}
