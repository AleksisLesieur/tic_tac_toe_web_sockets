const nameModal = document.getElementById("myModal");

const nameInput = document.getElementById("nameInput");

const saveButton = document.getElementById("saveButton");

let userName = "default";

document.addEventListener("DOMContentLoaded", function () {
    nameInput.focus();
})

// ensuring that the button remains disabled unless criterias are met and keyboard "enter" + mouse click works

nameInput.addEventListener("input", function () {
  saveButton.disabled = nameInput.value.trim() === "";
  userName = nameInput.value;
})
    
nameInput.addEventListener("keypress", function (event) {
  saveButton.disabled = nameInput.value.trim() === "";
  if (event.key === "Enter") {
    sendingPlayerData();
  }
});

saveButton.addEventListener("click", function () {
  sendingPlayerData()
});

async function sendingPlayerData() {

  nameModal.style.display = "none";
  
  fetch("https://ntfy.sh/tic_tac_toe", {
    method: "POST", // PUT works too
    body: `someone with name ${userName} just joined!`,
  });

  location.href = "http://localhost:8000/game";

  const response = await fetch('http://localhost:8000/player_data', {
    method: "POST", 
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      playerName: userName
    })
  })
  return response.json()
}
