import {
  GRID_SIZE,
  TICK_MS,
  createGameState,
  queueDirection,
  stepGame,
  togglePause,
} from "./game.js";

const board = document.querySelector("#board");
const scoreValue = document.querySelector("#score");
const statusText = document.querySelector("#status");
const pauseButton = document.querySelector("#pause-button");
const restartButton = document.querySelector("#restart-button");
const controlButtons = document.querySelectorAll("[data-direction]");

let state = createGameState();
let timerId = null;

function buildBoard() {
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < GRID_SIZE * GRID_SIZE; index += 1) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.index = String(index);
    fragment.appendChild(cell);
  }

  board.replaceChildren(fragment);
}

function render() {
  const cells = board.children;

  for (const cell of cells) {
    cell.className = "cell";
  }

  if (state.food) {
    const foodIndex = state.food.y * GRID_SIZE + state.food.x;
    cells[foodIndex]?.classList.add("food");
  }

  state.snake.forEach((segment, index) => {
    const cellIndex = segment.y * GRID_SIZE + segment.x;
    cells[cellIndex]?.classList.add("snake");
    if (index === 0) {
      cells[cellIndex]?.classList.add("head");
    }
  });

  scoreValue.textContent = String(state.score);

  if (state.isGameOver) {
    statusText.textContent = "Game over. Press restart to play again.";
  } else if (!state.hasStarted) {
    statusText.textContent = "Use arrow keys or WASD to start.";
  } else if (state.isPaused) {
    statusText.textContent = "Paused.";
  } else {
    statusText.textContent = "Collect food and avoid the walls and yourself.";
  }

  pauseButton.textContent = state.isPaused ? "Resume" : "Pause";
}

function tick() {
  state = stepGame(state);
  render();

  if (state.isGameOver) {
    stopLoop();
  }
}

function startLoop() {
  if (timerId !== null) {
    return;
  }

  timerId = window.setInterval(tick, TICK_MS);
}

function stopLoop() {
  if (timerId === null) {
    return;
  }

  window.clearInterval(timerId);
  timerId = null;
}

function restartGame() {
  state = createGameState();
  stopLoop();
  render();
}

function handleDirection(direction) {
  state = queueDirection(state, direction);
  render();

  if (!state.isPaused && !state.isGameOver) {
    startLoop();
  }
}

function handleKeydown(event) {
  const direction = mapKeyToDirection(event.key);

  if (!direction) {
    if (event.key === " " || event.key === "Spacebar") {
      event.preventDefault();
      state = togglePause(state);
      if (state.isPaused) {
        stopLoop();
      } else if (!state.isGameOver) {
        startLoop();
      }
      render();
    }
    return;
  }

  event.preventDefault();
  handleDirection(direction);
}

function mapKeyToDirection(key) {
  switch (key.toLowerCase()) {
    case "arrowup":
    case "w":
      return "up";
    case "arrowdown":
    case "s":
      return "down";
    case "arrowleft":
    case "a":
      return "left";
    case "arrowright":
    case "d":
      return "right";
    default:
      return null;
  }
}

pauseButton.addEventListener("click", () => {
  state = togglePause(state);

  if (state.isPaused) {
    stopLoop();
  } else if (!state.isGameOver) {
    startLoop();
  }

  render();
});

restartButton.addEventListener("click", restartGame);

controlButtons.forEach((button) => {
  button.addEventListener("click", () => {
    handleDirection(button.dataset.direction);
  });
});

window.addEventListener("keydown", handleKeydown);

buildBoard();
render();
