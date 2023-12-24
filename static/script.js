const boxes = document.querySelectorAll('.box')

let currentPlayerFront = null

let currentBox = null

const modal = document.querySelector('.modal')

let clientId = Date.now() - 1_703_023_345_436

let receivedData;

const socket = new WebSocket(`ws://localhost:8000/ws/${clientId}`)

socket.onopen = function(event) {
    console.log('WebSocket connection established');
    console.log(event)
    modal.style.display = "none";
};


socket.onmessage = function (event) {
    receivedData = JSON.parse(event.data)
    let temporaryId = clientId
    let receivedId = receivedData.playerId
    let assignPlayer = Math.random()
    console.log(receivedData)
    console.log(clientId)
    if (receivedId === temporaryId) {
        modal.style.display = "block";
    }
    else {
        modal.style.display = "none";
    }
    for (let i = 0; i < 9; i++) {
        boxes[i].textContent = receivedData['board'][i]
    }
    // settingData()
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
            socket.send(JSON.stringify([index.toString(), clientId.toString()]));
        }
    })
})