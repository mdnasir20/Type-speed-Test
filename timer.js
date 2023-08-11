import {displayResult} from "./script.js"
export function startCountdownTimer() {
  let timeLeft = 60; // 60 seconds

  const timerElement = document.getElementById("timer");
  const startButton = document.getElementById("startButton"); // Replace 'timer' with the ID of your timer display element

  function updateTimerDisplay() {
    timerElement.textContent = `Time remaining: ${timeLeft} seconds`;
  }

  const countdownInterval = setInterval(function () {
    if (timeLeft > 0) {
      timeLeft--;
      updateTimerDisplay();
    } else {
      clearInterval(countdownInterval);
      startButton.disabled = false;
      timerElement.textContent = "Your time up!";
        displayResult()
    }
  }, 1000); // Update every 1000 milliseconds (1 second)
}
