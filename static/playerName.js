const nameModal = document.getElementById('myModal');
const nameInput = document.getElementById('nameInput');
const saveButton = document.getElementById('saveButton');
let userName = ''

// saveButton.addEventListener('click', sendingName())

// const socket = new WebSocket(`ws://localhost:8000/ws/${userName}`);

function toggleButton() {
    saveButton.disabled = nameInput.value.trim() === '';
}

window.onload = function () {
  toggleButton(); // Initial call to set the button state based on input
};

const socket = new WebSocket(`ws://localhost:8000/ws/${userName}`);

// function saveName() {
//     userName = nameInput.value;

//     // You can use the userName variable as needed, for example, display it in the console
//     console.log(`Hello, ${userName}!`);

//     // Close the nameModal after saving the name
//     closeModal();
// }

function saveUserData() {
  userName = nameInput.value
  closeModal()
}

saveButton.addEventListener('click', saveUserData);

nameInput.addEventListener('keypress', function (event) {
  if (event.key === 'Enter') {
    saveUserData();
  }
});

nameInput.addEventListener("input", function () {
  toggleButton();
});

function closeModal() {
  nameModal.style.display = 'none';
  fetch('https://ntfy.sh/tic-tac-toe', {
      method: 'POST', // PUT works too
      body: `someone with name ${userName} just joined!`
  })
    // secondPlayer.textContent = userName
  // location.href = 'http://localhost:8000/game'
  socket.send(userName)
}

// async function sendingName(str) {
//         const response = await fetch("http://localhost:8000/postUserName", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             name: str,
//           }),
//         });
    
//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         const data = await response.json()
//         console.log('Server response:', data);
//         console.log(userName)
//         return data
// }

// sendingName()

// Open the nameModal when the page loads (you can trigger this event based on user interaction)

// Listen for the "Enter" key press
// nameInput.addEventListener('keyup', function(event) {
//     if (event.key === 'Enter' && !saveButton.disabled) {
//         saveName();
//     }
// });

// Get user IP address using a third-party service (for demonstration purposes)
// document.addEventListener('DOMContentLoaded', function () {
//   fetch('https://api64.ipify.org?format=json')
//     .then(response => response.json())
//     .then(data => {
//       const userIP = data.ip;
//       console.log('User IP address:', userIP);
  
//       // Now you can send this IP address to your FastAPI server
//       // sendIPToServer(userIP);
//     })
//     .catch(error => console.error('Error fetching IP address:', error));
  
//   // function sendIPToServer(ip) {
//   //   // You can use AJAX, fetch, or any other method to send the IP address to your FastAPI server
//   //   // Example using fetch:
//   //   fetch('https://your-fastapi-server.com/save-ip', {
//   //     method: 'POST',
//   //     headers: {
//   //       'Content-Type': 'application/json',
//   //     },
//   //     body: JSON.stringify({ ip: ip }),
//   //   })
//   //   .then(response => response.json())
//   //   .then(data => console.log('Server response:', data))
//   //   .catch(error => console.error('Error sending IP to server:', error));
//   // }
// })

// // async function sendData(str) {
// //   fetch('localhost://8000/Alex', 'post' {

// //   })
// // }