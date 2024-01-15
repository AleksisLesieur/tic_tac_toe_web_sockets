// game lobby variables

const boxes = document.querySelectorAll(".box")

const firstPlayer = document.querySelector('.player1')

const secondPlayer = document.querySelector('.player2')

const modal = document.querySelector(".modal")

const modalContent = document.querySelector(".modal-content");

const modalText = document.querySelector(".modal-text");

const clientID = crypto.randomUUID();

const socket = new WebSocket(`ws://localhost:8000/ws/lobby/${clientID}`);

const savedBoard = new Array(9).fill(null);

let svgX;

let svgO;

// remove the 3 dots animation on certain modals

const style = document.createElement("style");

style.innerHTML = `
.modal-content::after {
    content: none;
    animation: none;
}

.modal-text .dots {
    display: none;
}`;

// adding mobile responsiveness to the SVG elements


document.addEventListener("DOMContentLoaded", function () {
    if (window.innerWidth >= 900) {
        svgX = `<svg width="150" height="150" viewBox="0 0 100 100">
            <line path class="path" x1="10%" y1="10%" x2="90%" y2="90%" stroke="red" stroke-width="7.5"></line>
            <line path class="path2" x1="10%" y1="90%" x2="90%" y2="10%" stroke="red" stroke-width="7.5"></line>
            </svg>`;
        svgO = `<svg width="150" height="150" viewBox="0 0 100 100">
            <circle id="my-circle" class="fill path3" cx="50%" cy="50%" r="43.333%" fill="none" stroke="green" stroke-width="7.5" stroke-dasharray="565.4867" />
            </svg>`;
    } else if (window.innerWidth < 900 && window.innerWidth > 600) {
        svgX = `<svg width="100" height="100" viewBox="0 0 100 100">
            <line path class="path" x1="10%" y1="10%" x2="90%" y2="90%" stroke="red" stroke-width="7.5"></line>
            <line path class="path2" x1="10%" y1="90%" x2="90%" y2="10%" stroke="red" stroke-width="7.5"></line>
            </svg>`;
        svgO = `<svg width="100" height="100" viewBox="0 0 100 100">
            <circle id="my-circle" class="fill path3" cx="50%" cy="50%" r="43.333%" fill="none" stroke="green" stroke-width="7.5" stroke-dasharray="565.4867" />
            </svg>`;
    } else {
        svgX = `<svg width="75" height="75" viewBox="0 0 100 100">
            <line path class="path" x1="10%" y1="10%" x2="90%" y2="90%" stroke="red" stroke-width="7.5"></line>
            <line path class="path2" x1="10%" y1="90%" x2="90%" y2="10%" stroke="red" stroke-width="7.5"></line>
            </svg>`;
        svgO = `<svg width="75" height="75" viewBox="0 0 100 100">
            <circle id="my-circle" class="fill path3" cx="50%" cy="50%" r="43.333%" fill="none" stroke="green" stroke-width="7.5" stroke-dasharray="565.4867" />
            </svg>`;
    }
});

socket.onopen = function (event) {
  console.log("WebSocket connection established");
  console.log(event);
  modal.style.display = "none";
  updatePlayerNames()
};

socket.onclose = function (e) {
  console.log("WebSocket connection closed", e);
  modal.style.display = "block";
  socket.close();
};

socket.onerror = function (err) {
  console.error("WebSocket error", err);
  socket.close();
};

socket.onmessage = function (event) {
  console.log("on message event");
  console.log(event);

  const emptyBoard = savedBoard.every((element) => element === null);

  const localID = localStorage.getItem("playerID");

  const receivedData = JSON.parse(event.data);

  const messageType = JSON.parse(event.data).message_type;

  console.log(receivedData);


  // if (messageType === "waiting_for_player") {
  //   // modal.style.display = "block";
  //   modalText.textContent = "Please wait! I'll login shortly";
  // }
  if (messageType === "player_data") {
    firstPlayer.textContent = receivedData.first_player.name;
    secondPlayer.textContent = receivedData.second_player.name;
    if (receivedData.second_player.ID === localID) {
      // modal.style.display = "block";
      modalText.textContent = "I've just logged in! Thinking of a move";
    }
  } else if (messageType === "full_room") {
    console.log(messageType, "message type");
    // modal.style.display = "block";
    modalText.textContent = "Sorry, the room is currently full!";
    document.head.appendChild(style);
  }


  if (messageType === "game_state") {
    console.log(messageType, "message type");
    for (let i = 0; i < 9; i++) {
      const currentSymbol = receivedData["board"][i];
      let newSVG = "";
      if (currentSymbol == "X") {
        newSVG = svgX;
      } else if (currentSymbol === "O") {
        newSVG = svgO;
      }
      savedBoard[i] = newSVG;
      if (boxes[i].textContent === "") {
        boxes[i].innerHTML = savedBoard[i];
      }
    }
  }
};

boxes.forEach(function (element, index) {
  element.addEventListener("click", function () {
    if (boxes[index].textContent === "") {
      boxes[index] = savedBoard[index];
      socket.send(index.toString());
    }
  });
});


function updatePlayerNames() {
  // Fetch player data from the server or update names based on your logic
  // Example: Fetch player data from a server endpoint
  fetch(`ws://localhost:8000/ws/lobby/${clientID}`)
    .then((response) => response.json())
    .then((data) => {
      // Assuming your data structure is similar to { first_player: { name: 'Player1' }, second_player: { name: 'Player2' } }
      firstPlayer.textContent = data.first_player.name;
      secondPlayer.textContent = data.second_player.name;
    })
    .catch((error) => {
      console.error("Error fetching player data:", error);
    });
}
