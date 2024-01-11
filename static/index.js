const boxes = document.querySelectorAll(".box");

const firstPlayer = document.querySelector('.player1')

const secondPlayer = document.querySelector('.player2')

let currentBox = null;

let namedSubmited = false

const modal = document.querySelector(".modal");

const modalContent = document.querySelector('.modal-content');

const modalText = document.querySelector(".modal-text");

const dots = document.querySelector(".dots")

let svgX;

let svgO;

// function calcSVG() {
//   let defaultSVG = 150;

//   let resizeSVG = window.innerWidth / 6

//   if (defaultSVG > resizeSVG) {
//     defaultSVG = 150
//   } else {
//     defaultSVG = resizeSVG
//   }

//   svgX = `<svg width="${defaultSVG}" height="${defaultSVG}" viewBox="0 0 100 100">
//   <line path class="path" x1="10%" y1="10%" x2="90%" y2="90%" stroke="red" stroke-width="7.5"></line>
//   <line path class="path2" x1="10%" y1="90%" x2="90%" y2="10%" stroke="red" stroke-width="7.5"></line>
//   </svg>`;

//   svgO = `<svg width="${defaultSVG}" height="${defaultSVG}" viewBox="0 0 100 100">
//   <circle id="my-circle" class="fill path3" cx="50%" cy="50%" r="43.333%" fill="none" stroke="green" stroke-width="7.5" stroke-dasharray="565.4867" />
//   </svg>`;
// }

// document.addEventListener('DOMContentLoaded', calcSVG)

// window.addEventListener('resize', calcSVG)

svgX = `<svg width="150" height="150" viewBox="0 0 100 100">
  <line path class="path" x1="10%" y1="10%" x2="90%" y2="90%" stroke="red" stroke-width="7.5"></line>
  <line path class="path2" x1="10%" y1="90%" x2="90%" y2="10%" stroke="red" stroke-width="7.5"></line>
</svg>`;

svgO = `<svg width="150" height="150" viewBox="0 0 100 100">
  <circle id="my-circle" class="fill path3" cx="50%" cy="50%" r="43.333%" fill="none" stroke="green" stroke-width="7.5" stroke-dasharray="565.4867" />
</svg>`

// svgX = `<svg width="75" height="75" viewBox="0 0 100 100">
//   <line path class="path" x1="10%" y1="10%" x2="90%" y2="90%" stroke="red" stroke-width="7.5"></line>
//   <line path class="path2" x1="10%" y1="90%" x2="90%" y2="10%" stroke="red" stroke-width="7.5"></line>
// </svg>`;

// svgO = `<svg width="75" height="75" viewBox="0 0 100 100">
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

// let clientId = Date.now() - 1_703_023_345_436;

let clientId = crypto.randomUUID()

const socket = new WebSocket(`ws://localhost:8000/ws/lobby/${clientId}`);

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
  modal.style.display = "block";
};

let messageType;
let receivedData;
let savedBoard = new Array(9).fill(null);


window.addEventListener("load", (event) => {
  firstPlayer.textContent = localStorage.getItem("firstName");
  secondPlayer.textContent = localStorage.getItem("secondName");
});

socket.onmessage = function (event) {
  console.log("on message event");
  console.log(event);

  messageType = JSON.parse(event.data).message_type
  receivedData = JSON.parse(event.data);

  if (messageType === "waiting_for_player") {
    console.log(messageType, 'message type')
    modal.style.display = "block"
    modalText.textContent = "Please wait! I'll login shortly"
    return;
  } else if (messageType === "full_room") {
    console.log(messageType, 'message type');
    modal.style.display = "block"
    modalText.textContent = "Sorry, the room is currently full!"
    document.head.appendChild(style)
    return;
  } else if (messageType === "player_dc") {
    console.log(messageType, 'message type');
    modal.style.display = "block"
    modalText.textContent = "The player has disconnected, please click 'restart the game' button or refresh the page!"
    document.head.appendChild(style)
    return; // why it doesn't work without return here? why the bottom code runs after this return?
  }

  const temporaryId = clientId
  const receivedId = receivedData.playerId

  if (receivedId === temporaryId) {
    console.log(receivedId, temporaryId, " ids");
    console.log(messageType, 'message type');
    modal.style.display = "block"
    modalText.textContent = "Waiting for the other player turn"
  } else {
    modal.style.display = "none"
  }

  if (messageType === "game_state") {
    console.log(messageType, 'message type');
    for (let i = 0; i < 9; i++) {
      const currentSymbol = receivedData["board"][i];
      let newSVG = ''
      if (currentSymbol == "X") {
        newSVG = svgX
      } else if (currentSymbol === "O") {
        newSVG = svgO;
      }
      savedBoard[i] = newSVG
      if (boxes[i].textContent === '') { //checks if div is empty or not
        boxes[i].innerHTML = savedBoard[i];
      }
    }
  }
};

socket.onerror = function (err) {
  console.error("WebSocket error", err);
  socket.close();
};

console.log(boxes[0]);
console.log("boxes above this");

boxes.forEach(function (element, index) {
  element.addEventListener("click", function () {
    if (boxes[index].textContent === "") {
      boxes[index] = savedBoard[index]
      socket.send(JSON.stringify([index.toString(), clientId]));
    }
  });
});


