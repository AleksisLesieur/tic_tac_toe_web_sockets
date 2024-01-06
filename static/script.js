const boxes = document.querySelectorAll(".box");

const firstPlayer = document.querySelector('.player1')

const secondPlayer = document.querySelector('.player2')

let currentPlayerFront = null;

let currentBox = null;

let namedSubmited = false

const modal = document.querySelector(".modal");

const modalContent = document.querySelector('.modal-content');

const modalText = document.querySelector(".modal-text");

const dots = document.querySelector(".dots")

const svgX = `<svg width="150" height="150" viewBox="0 0 100 100">
  <line path class="path" x1="10%" y1="10%" x2="90%" y2="90%" stroke="red" stroke-width="7.5"></line>
  <line path class="path2" x1="10%" y1="90%" x2="90%" y2="10%" stroke="red" stroke-width="7.5"></line>
</svg>`;

const svgO = `<svg width="150" height="150" viewBox="0 0 100 100">
  <circle id="my-circle" class="fill path3" cx="50%" cy="50%" r="43.333%" fill="none" stroke="green" stroke-width="7.5" stroke-dasharray="565.4867" />
</svg>`

// const svgX = `<svg width="75" height="75" viewBox="0 0 75 75">
//   <line path class="path" x1="10%" y1="10%" x2="90%" y2="90%" stroke="red" stroke-width="7.5"></line>
//   <line path class="path2" x1="10%" y1="90%" x2="90%" y2="10%" stroke="red" stroke-width="7.5"></line>
// </svg>`;
//
// const svgO = `<svg width="75" height="75" viewBox="0 0 75 75">
//   <circle id="my-circle" class="fill path3" cx="50%" cy="50%" r="43.333%" fill="none" stroke="green" stroke-width="7.5" stroke-dasharray="565.4867" />
// </svg>`;

// let currentSymbol;

// Create a style element
const style = document.createElement('style');

// Add your CSS rules to override the modal-content::after properties
style.innerHTML = `
.modal-content::after {
    content: none;
    animation: none;
}

.modal-text .dots {
    display: none;
}`;

let showModal = false;

let clientId = Date.now() - 1_703_023_345_436;

let receivedData;

const socket = new WebSocket(`ws://localhost:8000/ws/${clientId}`);

let svgStyleAppended = false

socket.onopen = function (event) {
  console.log("WebSocket connection established");
  console.log(event);
  // if (!svgStyleAppended) {
  //   document.head.appendChild(style);
  //   svgStyleAppended = true
  // }

  modal.style.display = "none";
};

socket.onclose = function (e) {
  console.log("WebSocket connection closed", e);
  // modal.style.display = "block";
};

socket.onmessage = function (event) {
  console.log("on message event");
  console.log(event);

  if (event.data === "waiting_for_player") {
    modal.style.display = "block";
    modalText.textContent = "Please wait! I'll login shortly";
    return;
  }

    else if (event.data === "full_room") {
    modal.style.display = "block";
    modalText.textContent = "Sorry, the room is currently full, please try again later!";
    document.head.appendChild(style);
    return;
  } else if (event.data === "player_dc") {
    modal.style.display = "block";
    modalText.textContent = 'The player has disconnected, please click "restart the game" button or refresh the page!';
    document.head.appendChild(style);
    return;
  }

  receivedData = JSON.parse(event.data);
  let temporaryId = clientId;
  let receivedId = receivedData.playerId;
  console.log(receivedData);
  if (receivedId === temporaryId) {
    modal.style.display = "block";
    modalText.textContent = "Waiting for the other player turn";
  } else {
    modal.style.display = "none";
  }
  for (let i = 0; i < 9; i++) {
    const currentSymbol = receivedData["board"][i];

    if (boxes[i].dataset.symbol === currentSymbol) continue;
    // Create a new SVG element
    const newSvg = document.createElement("div");
    newSvg.innerHTML = currentSymbol === 'X' ? svgX : (currentSymbol === 'O' ? svgO : "");
    boxes[i].innerHTML = ''
    boxes[i].appendChild(newSvg)
    boxes[i].dataset.symbol = currentSymbol;
  }
  if (receivedData.type === "playerCount") {
    console.log(receivedData.count);
  }
  // currentPlayerFront = receivedData["currentPlayer"];
};

socket.onerror = function (err) {
  console.error("WebSocket error", err);
  socket.close();
};

console.log(boxes[0]);
console.log("boxes above this");

boxes.forEach(function (element, index) {
  element.addEventListener("click", function (boardData) {
    if (boxes[index].textContent === "") {
      socket.send(JSON.stringify([index.toString(), clientId.toString()]));
    }
  });
});


