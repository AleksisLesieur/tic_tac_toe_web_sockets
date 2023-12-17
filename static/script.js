const boxes = document.querySelectorAll('.box')

let currentPlayerFront = 'X'

let currentBox = null

let clientId = Date.now()

    const  socket = new WebSocket(`ws://localhost:8000/ws/${clientId}`)

    socket.onopen = function(event) {
        console.log('WebSocket connection established');
        console.log(event)
    };

    // socket.onmessage = function(event) {
    //     try {
    //         let receivedData = JSON.parse(event.data);
    //         console.log(event.data)
    //     } catch (e) {
    //         console.error('Error parsing JSON:', e);
    //     }
    // }
    socket.onmessage = function (event) {
        // let receivedData = Number(event.data[event.data.length - 1])
        // console.log(receivedData)
        // console.log(typeof receivedData)
        // console.log('on message has been loaded')
        // console.log(event.data);
        // console.log('console logging event data')
        // boardData['explicitOriginalTarget'].textContent = temp
        // boxes[receivedData].textContent = temp
        let receivedData = JSON.parse(event.data)
        // console.log(receivedData)
        for (let i=0; i<9; i++) {
            boxes[i].textContent = receivedData['board'][i]
        }
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
        if (boardData['explicitOriginalTarget'].textContent === '') {
            // let temp = currentPlayer
            // currentPlayerFront = temp === 'X' ? 'O' : 'X'
            console.log("sending")
            socket.send(index.toString())

        }
    })
})

// socket.onmessage = function (event) {
//     let receivedData = JSON.parse(event.data)
//     console.log(receivedData)
//
//     console.log('received data')
// }
    // receivedData.board.forEach((val, idx) => {
    //     if (val !== null) {
    //         boxes[idx].textContent = val;
    //     }
    // });

    // Update current player
    // boardData['explicitOriginalTarget'].textContent = receivedData.currentPlayer;


// window.onload = function() {
//     socket.send(JSON.stringify({ type: "pageLoad" }));
// };