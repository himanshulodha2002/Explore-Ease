function addToHistory() {
  var inputText = document.getElementById("inputText").value;
  if (inputText) {
    localStorage.setItem(
      "history",
      (localStorage.getItem("history") || "") + `<li>${inputText}</li>`
    );
    document.getElementById("inputText").value = "";
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////// *map
var map = L.map("map").setView([20.5937, 78.9629], 5);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);
