const nameModal = document.getElementById('myModal');
const nameInput = document.getElementById('nameInput');
const saveButton = document.getElementById('saveButton');
let userName = 'Mkicas'

// saveButton.addEventListener('click', sendingName())

function openModal() {
    nameModal.style.display = 'block';
}

function toggleButton() {
    saveButton.disabled = nameInput.value.trim() === '';
}

function saveName() {
    userName = nameInput.value;

    // You can use the userName variable as needed, for example, display it in the console
    console.log(`Hello, ${userName}!`);

    // Close the nameModal after saving the name
    closeModal();
}

function closeModal() {
    nameModal.style.display = 'none';
    fetch('https://ntfy.sh/tic-tac-toe', {
        method: 'POST', // PUT works too
        body: `someone with name ${userName} just joined!`
    })
    // secondPlayer.textContent = userName
    location.href = 'http://localhost:8000/game'
}

async function sendingName() {
        const response = await fetch('http://localhost:8000/', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: userName,
        });
    
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response
        console.log('Server response:', data);
        console.log(userName)
}

// Open the nameModal when the page loads (you can trigger this event based on user interaction)
window.onload = function () {
    openModal();
    toggleButton(); // Initial call to set the button state based on input
};

// Listen for the "Enter" key press
nameInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter' && !saveButton.disabled) {
        saveName();
    }
});