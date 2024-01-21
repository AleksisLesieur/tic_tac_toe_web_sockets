// game lobby variables

const boxes = document.querySelectorAll(".box")

const firstPlayer = document.querySelector('.player1')

const secondPlayer = document.querySelector('.player2')

const modal = document.querySelector(".modal")

const modalText = document.querySelector(".modal-text");

const Logout = document.querySelector(".logout")

let playerID = crypto.randomUUID();

const socket = new WebSocket(`ws://localhost:8000/ws/lobby/${playerID}`);

const playAgain = document.querySelector(".playAgain");

const savedBoard = new Array(9).fill(null);

let svgX = `<svg width="150" height="150" viewBox="0 0 100 100">
            <line path class="path" x1="10%" y1="10%" x2="90%" y2="90%" stroke="red" stroke-width="7.5"></line>
            <line path class="path2" x1="10%" y1="90%" x2="90%" y2="10%" stroke="red" stroke-width="7.5"></line>
            </svg>`;
let svgO = `<svg width="150" height="150" viewBox="0 0 100 100">
            <circle id="my-circle" class="fill path3" cx="50%" cy="50%" r="43.333%" fill="none" stroke="green" stroke-width="7.5" stroke-dasharray="565.4867" />
            </svg>`;

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

function adjustingSVG() {
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
}

let newSVG = svgX

function isBoardEmpty() {
  for (let item of savedBoard) {
    if (item !== null) {
      return false;
    }
  }
  return true;
}

Logout.addEventListener('click', function () {
  window.location.href = "http://localhost:8000/";
})

document.addEventListener("DOMContentLoaded", adjustingSVG);

document.addEventListener('resize', adjustingSVG)

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

  console.log(playerID, " playerID");
  // console.log(receivedData.firstPlayerID, " receivedID");

  if (messageType === "waiting_for_player") {
    modal.style.display = "block";
    if (window.performance.navigation.type === 1) {
      modalText.textContent = "Please wait! I'll login shortly";
    }
    return;
  } 
    
    // if (receivedData.second_player.ID === playerID && isBoardEmpty()) {
    //   modal.style.display = "block";
    //   modalText.textContent = "I've just logged in! Thinking of my first move";
    // }
    // function loadFirstModal(id) {
    //   if (receivedData.first_player.name === id && isBoardEmpty()) {
    //     modal.style.display = "block";
    //     modalText.textContent = "I've just logged in! Thinking of my first move";
    //   }
    // }

    // loadFirstModal(playerID)

  else if (messageType === "game_started") {
    firstPlayer.textContent = receivedData.playerNames[0];
    secondPlayer.textContent = receivedData.playerNames[1];
    if (playerID === receivedData.playerID[0]) {
      modal.style.display = 'none'
    } else {
      modal.style.display = "block";
      modalText.textContent = "I've just logged in! thinking of my first move"
    }

    for (let i = 0; i < 9; i++) {
      const boardData = receivedData["board"][i];
      if (boardData === "X") {
        savedBoard[i] = svgX;
      } else if (boardData === "O") {
        savedBoard[i] = svgO;
      }
      if (boxes[i].textContent === "") {
        boxes[i].innerHTML = savedBoard[i];
      }
    }
  }
  else if (messageType === 'full_room') {
    console.log(messageType, "message type");
    modal.style.display = "block";
    modalText.textContent = "Sorry, the room is currently full!";
    document.head.appendChild(style);
  } else if (messageType === "player_dc") {
    modal.style.display = "block";
    modalText.textContent = `The other player just disconnected, you're about to be logged out in 3 seconds!`;
    setTimeout(function () {
      modalText.textContent = `The other player just disconnected, you're about to be logged out in 2 seconds!`;
    }, 1000)
    setTimeout(function () {
      modalText.textContent = `The other player just disconnected, you're about to be logged out in 1 seconds!`;
    }, 2000);
    setTimeout(function () {
      modalText.textContent = `The other player just disconnected, you're about to be logged out in 0 seconds!`;
      window.location.href = "http://localhost:8000/";
    }, 3000);
    document.head.appendChild(style);
    return;
  }

  if (messageType === "player_data") {
    firstPlayer.textContent = receivedData.playerNames[0];
    secondPlayer.textContent = receivedData.playerNames[1];
    if (playerID === receivedData.clientID) {
      modal.style.display = "block";
      modalText.textContent = "Thinking of my next move";
    } else {
      modal.style.display = "none";
    }

    // const board = receivedData.board;

    if (receivedData.currentPlayer === "X") {
      newSVG = svgX;
    } else if (receivedData.currentPlayer === "O") {
      newSVG = svgO;
    }

    for (let i = 0; i < 9; i++) {
      const boardData = receivedData["board"][i]
      if (boardData === 'X') {
        savedBoard[i] = svgX
      } else if (boardData === 'O') {
        savedBoard[i] = svgO
      }
      if (boxes[i].textContent === "") {
        boxes[i].innerHTML = savedBoard[i]
      }
    }

    if (receivedData.result !== null) {
      if (receivedData.result === 'Tie') {
        modal.style.display = 'block'
        modalText.textContent = "It's a tie! Please logout to play again!"
      }
      if (receivedData.result === "X") {
        if (playerID === receivedData.playerIDs[0]) {
          modal.style.display = "block";
          modalText.textContent = "You've won! Congrats!";
        }
        if (playerID === receivedData.playerIDs[1]) {
          modal.style.display = "block";
          modalText.textContent = "You've lost :( wanna play again?";
        }
      }
      if (receivedData.result === "O") {
        if (playerID === receivedData.playerIDs[1]) {
          modal.style.display = "block";
          modalText.textContent = "You've won! Congrats!";
        }
        if (playerID === receivedData.playerIDs[0]) {
          modal.style.display = "block";
          modalText.textContent = "You've lost :( wanna play again?";
        }
      }
      document.head.appendChild(style);
      playAgain.disabled = false;
    }
  }
}



boxes.forEach(function (element, index) {
  console.log("Attaching listener to box #" + index, element);
  element.addEventListener("click", function () {
    console.log(element)
    console.log('testing things out')
    if (boxes[index].textContent === "") {
      console.log('socket was sent at index ' + index)
      // savedBoard[index] = newSVG
      // boxes[index].innerHTML = savedBoard[index]
      socket.send(index.toString());
    }
  });
});

playAgain.addEventListener('click', function () {
  for (const box of boxes) {
    box.innerHTML = ''
  }
})


// boxesData()

function justInCaseThePageWasRefreshed() {
  if (window.performance.navigation.type === 1) {
    modalText.textContent = `You refreshed the page, you're about to be logged out in 3 seconds!`;
    setTimeout(function () {
      modalText.textContent = `You refreshed the page, you're about to be logged out in 2 seconds!`;
    }, 1000);
    setTimeout(function () {
      modalText.textContent = `You refreshed the page, you're about to be logged out in 1 seconds!`;
    }, 2000);
    setTimeout(function () {
      modalText.textContent = `You refreshed the page, you're about to be logged out in 0 seconds!`;
      window.location.href = "http://localhost:8000/";
    }, 3000);
    document.head.appendChild(style);
    
  }
}


justInCaseThePageWasRefreshed()