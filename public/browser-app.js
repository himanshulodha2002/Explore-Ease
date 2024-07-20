function submitText() {
  const text = document.getElementById("inputText").value;
  const chatHistory = document.getElementById("chatHistory");

  const messageDiv = document.createElement("div");
  messageDiv.id = "chatBubbleUser";
  messageDiv.textContent = text;

  chatHistory.appendChild(messageDiv);
  chatHistory.scrollTop = chatHistory.scrollHeight;
  inputText.value = "";
  initiateFetch();
}
async function initiateFetch() {
  await startEventStream(); // Wait for startEventStream to finish
  await abc();
  const text = document.getElementById("chatBubbleAi").value;

  try {
    const response = await fetch("/optimize-route", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: text }),
    });
    //const data = await response.json();
    //drawRoute(data.cities, data.route);
    //await getPosition(data.position);
    
  } catch (error) {
    console.error("Failed to fetch data:", error);
  }
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

// async function abc() {
//   if (!navigator.geolocation) {
//     console.log("Your Browser does not support this Geolocation feature.");
//   } else {
//     const getPositionAsync = () =>
//       new Promise((resolve, reject) => {
//         navigator.geolocation.getCurrentPosition(resolve, reject);
//       });

//     async function updateLocation() {
//       try {
//         var marker, circle;
//         const position = await getPositionAsync();
//         console.log(position);
//         const lat = position.coords.latitude;
//         const long = position.coords.longitude;
//         const accuracy = position.coords.accuracy;

//         if (marker) {
//           map.removeLayer(marker);
//         }
//         if (circle) {
//           map.removeLayer(circle);
//         }

//         marker = L.marker([lat, long]).addTo(map);
//         circle = L.circle([lat, long], { radius: accuracy }).addTo(map);

//         var featureGroup = L.featureGroup([marker, circle]).addTo(map);
//         // map.fitBounds(featureGroup.getBounds());
//         L.Routing.control({
//           waypoints: [
//             L.latLng(lat, long), //your location
//             L.latLng(19.076, 72.8777), //city1
//           ],
//         }).addTo(map);

//         L.Routing.control({
//           waypoints: [
//             L.latLng(19.076, 72.8777), //city1
//             L.latLng(20.3974, 72.8328), //city2
//           ],
//         }).addTo(map);

//         L.Routing.control({
//           waypoints: [
//             L.latLng(20.3974, 72.8328), //city2
//             L.latLng(28.6139, 77.2088), //city3
//           ],
//         }).addTo(map);
//         console.log(
//           `Your Coordinate is: lat: ${lat} long: ${long} with your GPS accuracy: ${accuracy}`
//         );
//       } catch (error) {
//         console.error("Failed to get position:", error);
//       }
//     }

//     // Update location every 5 seconds
//     setInterval(updateLocation, 5000);
//   }
// }

async function abc() {
  if (!navigator.geolocation) {
    console.log("Your Browser does not support this Geolocation feature.");
  } else {
    const getPositionAsync = () =>
      new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

    async function updateLocation() {
      try {
        var marker, circle;
        const position = await getPositionAsync();
        console.log(position);
        const lat = position.coords.latitude;
        const long = position.coords.longitude;
        const accuracy = position.coords.accuracy;

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

        // Add routes without showing the routing control interface
        const routingControl1 = L.Routing.control({
          waypoints: [
            L.latLng(lat, long),
            L.latLng(19.076, 72.8777),
          ],
          fitSelectedRoutes: false,
          //createMarker: () => null, // Do not create default markers
        }).addTo(map);
        routingControl1.hide(); // Hide the routing control interface

        const routingControl2 = L.Routing.control({
          waypoints: [
            L.latLng(19.076, 72.8777),
            L.latLng(20.3974, 72.8328),
          ],
          fitSelectedRoutes: false,
          //createMarker: () => null,
        }).addTo(map);
        routingControl2.hide();

        const routingControl3 = L.Routing.control({
          waypoints: [
            L.latLng(20.3974, 72.8328),
            L.latLng(28.6139, 77.2088),
          ],
          fitSelectedRoutes: false,
          //createMarker: () => null,
        }).addTo(map);
        routingControl3.hide();

        console.log(
          `Your Coordinate is: lat: ${lat} long: ${long} with your GPS accuracy: ${accuracy}`
        );
      } catch (error) {
        console.error("Failed to get position:", error);
      }
    }

    // Update location every 5 seconds
    setInterval(updateLocation, 5000);

    // Hide the routing control interface
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = '.leaflet-routing-container { display: none !important; }';
    document.getElementsByTagName('head')[0].appendChild(style);
  }
}