const nameModal = document.getElementById("myModal");

const nameInput = document.getElementById("nameInput");

const saveButton = document.getElementById("saveButton");

// const canSendData =
//   (nameInput.value.trim() === nameInput.value.length < 16) === "";

const canSendData = () => nameInput.value.length < 16 && nameInput.value.trim() !== ""

let userName = "default";

saveButton.disabled = !canSendData();

document.body.addEventListener('click', function () {
  nameInput.focus()
})

document.addEventListener("DOMContentLoaded", async function () {
    await fetch("https://ntfy.sh/tic_tac_toe", {
      method: "POST", // PUT works too
      body: "Someone just visited your page!",
    });
})

// ensuring that the button remains disabled unless criterias are met and keyboard "enter" + mouse click works

nameInput.addEventListener("input", function () {
  saveButton.disabled = !canSendData()
  userName = nameInput.value.trim()
})
    
nameInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter" && canSendData()) {
    sendingPlayerData();
  }
});

saveButton.addEventListener("click", function () {
  sendingPlayerData()
});

async function sendingPlayerData() {
  nameModal.style.display = "none";

  await fetch("https://ntfy.sh/tic_tac_toe", {
    method: "POST", // PUT works too
    body: `Somebody with the name ${userName} wants to play!`,
  });

  const response = await fetch("https://tic-tac-toe-pus7t.ondigitalocean.app/player_data",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        playerName: userName,
      }),
    }
  );

  if (response.ok) {
    window.location.href = "https://tic-tac-toe-pus7t.ondigitalocean.app/game";
    return response.json();
  }
}

