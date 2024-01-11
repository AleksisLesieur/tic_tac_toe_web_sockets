const nameModal = document.getElementById('myModal');
const nameInput = document.getElementById('nameInput');
const saveButton = document.getElementById('saveButton');
let userName = 'default'

// saveButton.addEventListener('click', sendingName())

// const socket = new WebSocket(`ws://localhost:8000/ws/${userName}`);

function toggleButton() {
    saveButton.disabled = nameInput.value.trim() === '';
}

window.onload = function () {
  toggleButton(); // Initial call to set the button state based on input
};

const socket = new WebSocket(`ws://localhost:8000/ws/user/${userName}`);

function saveUserData() {
  userName = nameInput.value
  closeModal()
}

saveButton.addEventListener('click', saveUserData);

nameInput.addEventListener('keypress', function (event) {
  if (event.key === 'Enter') {
    saveUserData();
  }
});

nameInput.addEventListener("input", function () {
  toggleButton();
});

function closeModal() {
  nameModal.style.display = 'none';
  fetch('https://ntfy.sh/tic-tac-toe', {
      method: 'POST', // PUT works too
      body: `someone with name ${userName} just joined!`
  })
    // secondPlayer.textContent = userName
  location.href = 'http://localhost:8000/game'
  socket.send(userName)
}

// For socket
socket.onopen = event => {
    console.log("WebSocket2 connection opened:", event);
};

socket.onclose = event => {
    console.log("WebSocket2 connection closed:", event);
};

socket.onerror = event => {
    console.error("WebSocket2 error:", event);
};

socket.onmessage = function (event) {
  console.log("on message event");
  let data = JSON.parse(event.data)
  console.log(data)
  if (data.message_type === 'player_names') {
    localStorage.setItem("firstName", data.firstName)
    localStorage.setItem("secondName", data.secondName);
  }
};