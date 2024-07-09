function addToHistory() {
  const inputText = document.getElementById("inputText");
  const chatHistory = document.getElementById("chatHistory");

  // Create a new div element for the message
  const messageDiv = document.createElement("div");
  messageDiv.textContent = inputText.value; // Set the text content to the input value

  // Append the new message div to the chat history
  chatHistory.appendChild(messageDiv);

  // Clear the input field after submitting
  inputText.value = "";
}

////////////////////////////////////////////////////////////////////////////////////////////////////// *map
var map = L.map("map").setView([20.5937, 78.9629], 5);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);
