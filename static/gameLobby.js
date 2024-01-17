// game lobby variables

const boxes = document.querySelectorAll(".box")

const firstPlayer = document.querySelector('.player1')

const secondPlayer = document.querySelector('.player2')

const modal = document.querySelector(".modal")

const modalText = document.querySelector(".modal-text");

const playerID = crypto.randomUUID();

const socket = new WebSocket(`ws://localhost:8000/ws/lobby/${playerID}`);

const savedBoard = new Array(9).fill(null);

const isSavedBoardEmpty = savedBoard.every(function (element) {
  return element === null
})

console.log(isSavedBoardEmpty)

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
};

socket.onclose = function (e) {
  console.log("WebSocket connection closed", e);
  modal.style.display = "block";
  modalText.textContent = "Sorry, the room is currently full!";
  socket.close();
};

socket.onerror = function (err) {
  console.error("WebSocket error", err);
  modal.style.display = "block";
  modalText.textContent = "Sorry, some form of error has occured, please refresh the page!";
  socket.close();
};

let receivedData;

socket.onmessage = function (event) {

  receivedData = JSON.parse(event.data);

  const messageType = JSON.parse(event.data).message_type;

  console.log("received data");

  console.log(receivedData);

  if (messageType === "waiting_for_player") {
    modal.style.display = "block";
    modalText.textContent = "Please wait! I'll login shortly";
    return;
  } else if (messageType === "player_data") {

    firstPlayer.textContent = receivedData.first_player.name;
    secondPlayer.textContent = receivedData.second_player.name;

    if (!localStorage.getItem("firstPlayer") && !localStorage.getItem("secondPlayer")) {
      localStorage.setItem("firstPlayer", receivedData.first_player.name);
      localStorage.setItem("secondPlayer", receivedData.second_player.name);
    }
  
  } else if (messageType === "game_started") {
    modal.style.display = "none"
    if (receivedData.firstPlayerID === playerID) {
      modal.style.display = "block";
      modalText.textContent = "I've just logged in! Thinking of my first move";
    }
    return;
  } else if (messageType === 'full_room') {
    console.log(messageType, "message type");
    modal.style.display = "block";
    modalText.textContent = "Sorry, the room is currently full!";
    document.head.appendChild(style);
    return;
  } else if (messageType === "player_dc") {
    modal.style.display = "block";
    modalText.textContent = "The other player just disconnected, please logout or refresh your page!";
    document.head.appendChild(style);
    return;
  }

  if (messageType === "game_state") {
    if (playerID === receivedData.clientID) {
      modal.style.display = "block";
      modalText.textContent = "Thinking of a move";
      modalText.style.textAlign = "center";
    } else {
      modal.style.display = "none";
    }
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
