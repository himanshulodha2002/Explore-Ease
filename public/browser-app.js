function submitText() {
  const text = document.getElementById("inputText").value;
  const chatHistory = document.getElementById("chatHistory");

  const messageDiv = document.createElement("div");
  messageDiv.id = "chatBubbleUser";
  messageDiv.textContent = text;

  chatHistory.appendChild(messageDiv);
  chatHistory.scrollTop = chatHistory.scrollHeight;
  inputText.value = "";
  fetch("/optimize-route", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: text }),
  })
    .then((response) => response.json())
    .then((data) => {
      drawRoute(data.cities, data.route);
    });
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

function drawRoute(cities, route) {
  const map = L.map("map").setView([37.7749, -122.4194], 4);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

  const cityCoordinates = {};
  cities.forEach((city) => {
    cityCoordinates[city] = getCityCoordinates(city);
  });

  route.forEach(({ city1, city2 }) => {
    const coords1 = cityCoordinates[city1];
    const coords2 = cityCoordinates[city2];
    L.polyline([coords1, coords2], { color: "blue" }).addTo(map);
  });
}

function getCityCoordinates(city) {
  // This function should return the coordinates of the city
  // You can use a predefined set of coordinates or an API
  const predefinedCoordinates = {
    "New York": [40.7128, -74.006],
    "Los Angeles": [34.0522, -118.2437],
    Chicago: [41.8781, -87.6298],
    Denver: [39.7392, -104.9903],
  };
  return predefinedCoordinates[city] || [0, 0];
}
