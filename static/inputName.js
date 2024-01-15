const nameModal = document.getElementById("myModal");

const nameInput = document.getElementById("nameInput");

const saveButton = document.getElementById("saveButton");

let userName = "default";

const clientID = crypto.randomUUID();

const socket = new WebSocket(`ws://localhost:8000/ws/name/${clientID}`);

document.addEventListener("DOMContentLoaded", function () {
    nameInput.focus();
})

// ensuring that the button remains disabled unless criterias are met and keyboard "enter" + mouse click works

nameInput.addEventListener("input", function () {
    saveButton.disabled = nameInput.value.trim() === "";
    userName = nameInput.value;
})
    
nameInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    sendingPlayerData();
  }
});

saveButton.addEventListener("click", function () {
  sendingPlayerData();
});

// function that sends user ID and name to the backend

function sendingPlayerData() {
  nameModal.style.display = "none";
  fetch("https://ntfy.sh/tic_tac_toe", {
    method: "POST", // PUT works too
    body: `someone with name ${userName} just joined!`,
  });
  // secondPlayer.textContent = userName
  location.href = "http://localhost:8000/game";
  // separating one player from the other on the front end part
  localStorage.setItem("player_name", userName);
  localStorage.setItem("playerID", clientID);
  // sending data to the backend
  socket.send(JSON.stringify([userName, clientID]));
}

socket.onopen = function (event) {
  console.log("WebSocket connection established");
  console.log(event);
  // modal.style.display = "none";
};

socket.onclose = function (e) {
  console.log("WebSocket connection closed", e);
//   modal.style.display = "block";
  socket.close();
};

socket.onerror = function (err) {
  console.error("WebSocket error", err);
  socket.close();
};
