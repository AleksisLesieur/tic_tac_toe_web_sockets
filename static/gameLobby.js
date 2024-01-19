// game lobby variables

const boxes = document.querySelectorAll(".box")

const firstPlayer = document.querySelector('.player1')

const secondPlayer = document.querySelector('.player2')

const modal = document.querySelector(".modal")

const modalText = document.querySelector(".modal-text");

let playerID = crypto.randomUUID();

let temporaryID = ''

const socket = new WebSocket(`ws://localhost:8000/ws/lobby/${playerID}`);

const savedBoard = new Array(9).fill(null);

let savedName = ''

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
  let gettingOldID = event.currentTarget.url
  let gettingOldID2 = gettingOldID.replace("ws://localhost:8000/ws/lobby/", "");
  temporaryID = gettingOldID2
  console.log(gettingOldID2)
  playerID = gettingOldID2
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
  console.log(temporaryID, " temporaryID");
  console.log(receivedData.firstPlayerID, " receivedID");

  if (messageType === "waiting_for_player") {
    modal.style.display = "block";
    modalText.textContent = "Please wait! I'll login shortly";
    // if (!!receivedData.first_player) {
    //   modalText.textContent = `Some error just occured, you're about to be logged out in 3 seconds!`;
    //   setTimeout(function () {
    //     modalText.textContent = `Some error just occured, you're about to be logged out in 2 seconds!`;
    //   }, 1000);
    //   setTimeout(function () {
    //     modalText.textContent = `Some error just occured, you're about to be logged out in 1 seconds!`;
    //   }, 2000);
    //   setTimeout(function () {
    //     modalText.textContent = `Some error just occured, you're about to be logged out in 0 seconds!`;
    //     location.href = "http://localhost:8000/";
    //   }, 3000);
    // }
    return;
  } else if (messageType === "player_data") {

    firstPlayer.textContent = receivedData.first_player.name;
    secondPlayer.textContent = receivedData.second_player.name;
  
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

  if (messageType === "game_state") {
    if (playerID === receivedData.clientID) {
      modal.style.display = "block";
      modalText.textContent = "Thinking of my next move";
    } else {
      modal.style.display = "none";
    }
      console.log(messageType, "message type");
      for (let i = 0; i < 9; i++) {
        const currentSymbol = receivedData["board"][i];
        let newSVG = ''
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
    // let tieCondition = savedBoard.every(function (element) {
    //   return typeof element === 'string'
    // })

    // if (tieCondition) {
    //     modal.style.display = "block";
    //     modalText.textContent = "It's a tie! Wanna play again?";
    //     document.head.appendChild(style);
    // }
  }
  
   if (messageType === "result") {
     console.log("trying to find a way to separate both players");
     console.log(receivedData.result);
     console.log(receivedData["board"]);
  }
}
  

boxes.forEach(function (element, index) {
  element.addEventListener("click", function () {
    if (boxes[index].textContent === "") {
      boxes[index] = savedBoard[index];
      socket.send(index.toString());
    }
  });
});

// window.onbeforeunload = function () {
//   // The returned string is displayed in the confirmation dialog
//   modalText.textContent = `You've just refreshed the page, you're about to be logged out in 3 seconds!`;
//   setTimeout(function () {
//     modalText.textContent = `You've just refreshed the page, you're about to be logged out in 2 seconds!`;
//   }, 1000);
//   setTimeout(function () {
//     modalText.textContent = `You've just refreshed the page, you're about to be logged out in 1 seconds!`;
//   }, 2000);
//   setTimeout(function () {
//     modalText.textContent = `You've just refreshed the page, you're about to be logged out in 0 seconds!`;
//   }, 3000);
//   window.location.href = "http://localhost:8000/";
// };

// // Handle the page unload event
// window.addEventListener("unload", function () {
//   // Redirect to the desired URL
//   location.href = "http://localhost:8000/";
// });