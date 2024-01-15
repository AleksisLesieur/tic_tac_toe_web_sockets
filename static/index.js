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

// playerName js begins here

const nameModal = document.getElementById('myModal');
const nameInput = document.getElementById('nameInput');
const saveButton = document.getElementById('saveButton');
let userName = 'default'

let messageType;
let receivedData;
let savedBoard = new Array(9).fill(null);

let showModal = false;

// let clientID = Date.now() - 1_703_023_345_436;

let clientID = crypto.randomUUID();

let gameID = crypto.randomUUID();

const socket = new WebSocket(`ws://localhost:8000/ws/lobby/${clientID}`);

let svgStyleAppended = false;

// saveButton.addEventListener('click', sendingName())

// const socket = new WebSocket(`ws://localhost:8000/ws/${userName}`);


document.addEventListener('DOMContentLoaded', function () {
  nameInput.focus()
})

// const socket = new WebSocket(`ws://localhost:8000/ws/user/${userName}`);

function saveUserData() {
  userName = nameInput.value;
  closeModal();
}

saveButton.addEventListener('click', saveUserData);

nameInput.addEventListener('keypress', function (event) {
  if (event.key === 'Enter') {
    saveUserData();
  }
});

nameInput.addEventListener("input", function () {
  saveButton.disabled = nameInput.value.trim() === "";
});

function closeModal() {
  nameModal.style.display = 'none';
  fetch('https://ntfy.sh/tic-tac-toe', {
      method: 'POST', // PUT works too
      body: `someone with name ${userName} just joined!`
  })
    // secondPlayer.textContent = userName
  location.href = 'http://localhost:8000/game'
  socket.send(JSON.stringify([userName, clientID]));
}

// playerName js ends here

// socket.onmessage = function (event) {
//   console.log("on message event");
//   let data = JSON.parse(event.data)
//   console.log(data)
//   if (data.message_type === 'player_names') {
//     localStorage.setItem("firstName", data.firstName)
//     localStorage.setItem("secondName", data.secondName);
//   }
// };

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
  socket.close()
};

socket.onerror = function (err) {
  console.error("WebSocket error", err);
  socket.close();
};

socket.onmessage = function (event) {
  console.log("on message event");
  console.log(event);

  messageType = JSON.parse(event.data).message_type
  receivedData = JSON.parse(event.data);

  const temporaryId = clientID;
  const receivedId = receivedData.playerId;

  console.log(receivedData)

  if (messageType === "waiting_for_player") {
    console.log(messageType, 'message type')
    modal.style.display = "block"
    modalText.textContent = "Please wait! I'll login shortly"
    return;
  } else if (messageType === "full_room") {
    console.log(messageType, "message type");
    modal.style.display = "block";
    modalText.textContent = "Sorry, the room is currently full!";
    document.head.appendChild(style);
    return;
  } else if (messageType === "player_dc") {
    console.log(messageType, "message type");
    modal.style.display = "block";
    modalText.textContent =
      "The player has disconnected, please click 'restart the game' button or refresh the page!";
    document.head.appendChild(style);
    return;
  }

  if (receivedId === temporaryId && messageType === 'game_state') {
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
      if (boxes[i].textContent === '') { 
        boxes[i].innerHTML = savedBoard[i];
      }
    }
  }
};


boxes.forEach(function (element, index) {
  element.addEventListener("click", function () {
    if (boxes[index].textContent === "") {
      boxes[index] = savedBoard[index]
      socket.send(index.toString());
    }
  });
});


