function submitText() {
  const text = document.getElementById("inputText").value;
  const chatHistory = document.getElementById("chatHistory");

  const messageDiv = document.createElement("div");
  messageDiv.id = "chatBubbleUser";
  messageDiv.textContent = text;

  chatHistory.appendChild(messageDiv);
  chatHistory.scrollTop = chatHistory.scrollHeight;
  inputText.value = "";
  initiateFetch(text);
}
async function initiateFetch(text) {

  await startEventStream(); // Wait for startEventStream to finish

  try {
    const response = await fetch("/optimize-route", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: text }),
    });
    const data = await response.json();

    // Check if we got valid waypoints
    if (data.waypoints && data.waypoints.length > 0) {
      console.log(`Route optimized with ${data.waypoints.length} waypoints`);
      console.log(`Total distance: ${data.totalDistance?.toFixed(2) || 'N/A'} km`);

      // Display route on map
      await abc(data.waypoints);

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
    displayError("Failed to optimize route. Please try again.");
  }
}

function displayRouteInfo(data) {
  const chatHistory = document.getElementById("chatHistory");
  const infoDiv = document.createElement("div");
  infoDiv.id = "routeInfo";
  infoDiv.style.cssText = "background: #e3f2fd; padding: 10px; margin: 10px 0; border-radius: 5px; font-size: 12px;";

  let routeText = `📍 Route optimized with ${data.route.length} cities\n`;
  routeText += `📏 Total distance: ${data.totalDistance.toFixed(2)} km\n\n`;
  routeText += `Route order:\n`;
  data.route.forEach((city, index) => {
    routeText += `${index + 1}. ${city.city || 'Point ' + index}\n`;
  });

  infoDiv.textContent = routeText;
  infoDiv.style.whiteSpace = "pre-line";
  chatHistory.appendChild(infoDiv);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

function displayError(message) {
  const chatHistory = document.getElementById("chatHistory");
  const errorDiv = document.createElement("div");
  errorDiv.id = "chatBubbleAi";
  errorDiv.style.cssText = "background: #ffebee; color: #c62828;";
  errorDiv.textContent = message;
  chatHistory.appendChild(errorDiv);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

function setupEventStream() {
  return new Promise((resolve, reject) => {
    const eventSource = new EventSource("/stream");
    const chatHistory = document.getElementById("chatHistory");
    const messageDiv = document.createElement("div");
    messageDiv.id = "chatBubbleAi";

    eventSource.onopen = () => {
      console.log("EventStream opened");
      resolve(eventSource); // Resolve when the stream is successfully opened
    };

    eventSource.onerror = (error) => {
      console.error("EventStream encountered an error:", error);
      reject(error); // Reject on error
    };

    eventSource.onmessage = function (event) {
      const data = JSON.parse(event.data);
      // Append the streamed data to the same div
      messageDiv.textContent += data.message.content; // Adjust according to the actual data structure and formatting needs
      chatHistory.appendChild(messageDiv);
      chatHistory.scrollTop = chatHistory.scrollHeight;
    };
  });
}

async function startEventStream() {
  try {
    const eventSource = await setupEventStream();
    // EventSource is ready to use
    console.log("EventStream is ready", eventSource);
  } catch (error) {
    console.error("Failed to setup EventStream", error);
  }
}

document
  .getElementById("inputText")
  .addEventListener("keypress", function (event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      submitText();
    }
  });

////////////////////////////////////////////////////////////////////////////////////////////////////// *map
var map = L.map("map").setView([20.5937, 78.9629], 5);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

async function abc(waypoints) {
  if (!navigator.geolocation) {
    console.log("Your Browser does not support this Geolocation feature.");
  } else {
    const getPositionAsync = () =>
      new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

    async function updateLocation(waypoints) {
      try {
        var marker, circle;
        const position = await getPositionAsync();
        console.log(position);
        const lat = position.coords.latitude;
        const long = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        waypoints[0].latitude = lat;
        waypoints[0].longitude = long;

        if (marker) {
          map.removeLayer(marker);
        }
        if (circle) {
          map.removeLayer(circle);
        }

        marker = L.marker([lat, long]).addTo(map);
        circle = L.circle([lat, long], { radius: accuracy }).addTo(map);

        var featureGroup = L.featureGroup([marker, circle]).addTo(map);
        // map.fitBounds(featureGroup.getBounds());

        map.eachLayer(function (layer) {
          if (layer instanceof L.Routing.Control) {
            map.removeLayer(layer);
          }
        });

        waypoints.forEach((waypoint, index) => {
          if (index < waypoints.length - 1) {
            // Ensure there's a next waypoint
            const routingControl = L.Routing.control({
              waypoints: [
                L.latLng(waypoint.latitude, waypoint.longitude),
                L.latLng(
                  waypoints[index + 1].latitude,
                  waypoints[index + 1].longitude
                ),
              ],
              fitSelectedRoutes: false,
              //createMarker: () => null,
            }).addTo(map);
            routingControl.hide();
          }
        });

        console.log(
          `Your Coordinate is: lat: ${lat} long: ${long} with your GPS accuracy: ${accuracy}`
        );
      } catch (error) {
        console.error("Failed to get position:", error);
      }
    }

    // Update location every 5 seconds
    // const waypoints = [
    //   { latitude: 0, longitude: 0 }, // Current location
    //   { latitude: 19.076, longitude: 72.8777 },
    //   { latitude: 20.3974, longitude: 72.8328 },
    //   { latitude: 28.6139, longitude: 77.2088 }
    // ];
    setInterval(updateLocation(waypoints), 5000);

    // Hide the routing control interface
    const style = document.createElement("style");
    style.type = "text/css";
    style.innerHTML =
      ".leaflet-routing-container { display: none !important; }";
    document.getElementsByTagName("head")[0].appendChild(style);
  }
}


function drawRoute(cities, route) {
  var latlngs = [];
  cities.forEach((city) => {
    latlngs.push([city.latitude, city.longitude]);
  });

  var polyline = L.polyline(latlngs, { color: "red" }).addTo(map);
  map.fitBounds(polyline.getBounds());
}

function getPosition(position) {
  var marker = L.marker([position.latitude, position.longitude]).addTo(map);
  map.setView([position.latitude, position.longitude], 13);
}



