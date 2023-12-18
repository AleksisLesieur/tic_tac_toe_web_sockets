const boxes = document.querySelectorAll('.box')

let currentPlayerFront = null

let currentBox = null

let clientId = Date.now()

let receivedData;

    const  socket = new WebSocket(`ws://localhost:8000/ws/${clientId}`)

    socket.onopen = function(event) {
        console.log('WebSocket connection established');
        console.log(event)
    };

    socket.onmessage = function (event) {
        receivedData = JSON.parse(event.data)
        console.log(receivedData)
        for (let i= 0; i<9; i++) {
            boxes[i].textContent = receivedData['board'][i]
        }
        currentPlayerFront = receivedData['currentPlayer']
    };

    socket.onclose = function(e) {
        console.log('WebSocket connection closed', e);
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
            // let temp = currentPlayer
            // currentPlayerFront = temp === 'X' ? 'O' : 'X'
            console.log("sending")
            socket.send(index.toString())
            console.log(boxes[index].textContent)
            // boardData['explicitOriginalTarget'].textContent = currentPlayerFront
        }
    })
})
