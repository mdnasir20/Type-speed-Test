import { startCountdownTimer } from "./timer.js";
const textToType = document.getElementById("textToType");
const userInput = document.getElementById("userInput");
const startButton = document.getElementById("startButton");
const resetButton = document.getElementById("resetButton");
const resultSection = document.getElementById("result");

const quoteApi = "https://poetrydb.org/title,random/Sonnet;3";

function getRandomText() {
  return fetch(quoteApi)
    .then((response) => response.json())
    .then((data) => data[0].lines.join(" "))
    .catch((error) => {
      console.log("Error fetching text:", error);
    });
}
async function renderNewQuote() {
  const quote = await getRandomText();
  textToType.innerHTML = "";
  quote.split("").forEach((character) => {
    const characterSpan = document.createElement("span");
    characterSpan.innerText = character;
    textToType.appendChild(characterSpan);
  });
  userInput.value = null;
}

userInput.addEventListener("input", () => {
  const arrayQuote = textToType.querySelectorAll("span");
  const arrayValue = userInput.value.split("");

  let correct = true;
  arrayQuote.forEach((characterSpan, index) => {
    const character = arrayValue[index];
    if (character == null) {
      characterSpan.classList.remove("correct");
      characterSpan.classList.remove("incorrect");
      correct = false;
    } else if (character === characterSpan.innerText) {
      characterSpan.classList.add("correct");
      characterSpan.classList.remove("incorrect");
    } else {
      characterSpan.classList.remove("correct");
      characterSpan.classList.add("incorrect");
      correct = false;
    }
  });

  if (correct) renderNewQuote();
});

let startTime;
let attempts = [];

function calculateMetrics(attempt) {
  const textLength = textToType.innerText.length;
  const typedLength = attempt.length;
  const timeTaken = (new Date() - startTime) / 1000; // in seconds

  const accuracy =
    textToType.innerText === attempt
      ? 100
      : textToType.innerText.slice(0, typedLength) === attempt
      ? (typedLength / textLength) * 100
      : 0;
  const speed = Math.round(typedLength / 5 / (timeTaken / 60)); // Assume average word length is 5

  return { accuracy, speed };
}

export function displayResult(attempt, metrics) {
  const newRow = document.createElement("tr");
  newRow.innerHTML = `<td>${
    metrics.speed
  } WPM</td><td>Accuracy<br>${metrics.accuracy.toFixed(2)}%</td>`;
  resultSection.appendChild(newRow);
}

function checkImprovement(newMetrics) {
  if (attempts.length > 1) {
    const prevMetrics = attempts[attempts.length - 2].metrics;
    const prevAccuracy = prevMetrics.accuracy;
    const newAccuracy = newMetrics.accuracy;

    if (newAccuracy > prevAccuracy) {
      return "Improved 🎉";
    } else if (newAccuracy < prevAccuracy) {
      return "Try Again 🙁";
    } else {
      return "Same as before";
    }
  } else {
    return "No previous attempts";
  }
}

function startTest() {
  const attempt = userInput.value.trim();
  if (!attempt) return;

  const metrics = calculateMetrics(attempt);
  displayResult(attempt, metrics);
  attempts.push({ attempt, metrics });

  const improvementMessage = checkImprovement(metrics);
  resultSection.lastElementChild.innerHTML += `<td>${improvementMessage}</td>`;

  localStorage.setItem("typeSpeedTestAttempts", JSON.stringify(attempts));

  userInput.value = "";
}

startButton.addEventListener("click", () => {
  if (!startTime) {
    startTime = new Date();
    startButton.textContent = "Submit";
    startButton.disabled = true;
  } else {
    startTest();
    startTime = null;
    startButton.textContent = "Start Again";
  }
  renderNewQuote();
  startCountdownTimer();
  userInput.focus();
});

window.addEventListener("DOMContentLoaded", () => {
  const storedAttempts = JSON.parse(
    localStorage.getItem("typeSpeedTestAttempts")
  );
  if (Array.isArray(storedAttempts) && storedAttempts.length > 0) {
    attempts = storedAttempts;
    for (const { attempt, metrics } of storedAttempts) {
      displayResult(attempt, metrics);
      const improvementMessage = checkImprovement(metrics);
      resultSection.lastElementChild.innerHTML += `<td>${improvementMessage}</td>`;
    }
  }
});

resetButton.addEventListener("click", () => {
  localStorage.clear();
  location.reload();
});
