const boxes = document.querySelectorAll('.box')

let currentPlayerFront = null

let currentBox = null

// const modal = document.getElementById("modal");

const firstPlayerModal = document.querySelector('.firstPlayer')

const secondPlayerModal = document.querySelector(".secondPlayer");

let clientId = Date.now() - 1503023345436

let receivedData;

const socket = new WebSocket(`ws://localhost:8000/ws/${clientId}`)

socket.onopen = function(event) {
    console.log('WebSocket connection established');
    console.log(event)
    firstPlayerModal.style.display = "none";
    secondPlayerModal.style.display = "none";
};

socket.onmessage = function (event) {
    receivedData = JSON.parse(event.data)
    console.log(receivedData)
    console.log(clientId)
    // if (receivedData.firstPlayer) {
    //   // Show modal for disconnection
    //     firstPlayerModal.style.display = "block";
    //     secondPlayerModal.style.display = "none";
    // }
    // else if (receivedData.secondPlayer) {
    //     firstPlayerModal.style.display = "none";
    //     secondPlayerModal.style.display = "block";
    // }

    for (let i = 0; i < 9; i++) {
        boxes[i].textContent = receivedData['board'][i]
    }
    currentPlayerFront = receivedData['currentPlayer']
};

socket.onclose = function(e) {
    console.log('WebSocket connection closed', e);
    // modal.style.display = "block";
};

socket.onerror = function(err) {
    console.error('WebSocket error', err);
    socket.close();
};

console.log(boxes[0])
console.log('boxes above this')

boxes.forEach(function(element, index ){
    element.addEventListener('click', function(boardData) {
        if (boxes[index].textContent === '') {
            console.log("sending")
            // socket.send(index.toString())
            socket.send(JSON.stringify([index.toString(), clientId.toString()]));
            console.log(boxes[index].textContent)
        }
    })
})