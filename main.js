const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Disable image smoothing for pixel art effect
ctx.imageSmoothingEnabled = false;

// Set canvas size (scaled for high DPI)
const borderHeight = window.innerHeight * 0.10;
canvas.width = window.innerWidth * window.devicePixelRatio;
canvas.height = (window.innerHeight - (borderHeight * 2)) * window.devicePixelRatio;
canvas.style.width = `${window.innerWidth}px`;
canvas.style.height = `${window.innerHeight - (borderHeight * 2)}px`;
canvas.style.position = "absolute";
canvas.style.top = `${borderHeight}px`;

ctx.scale(window.devicePixelRatio, window.devicePixelRatio); // Scale context for high DPI screens


const gridSize = 8; // Grid size (6x6)
const cellSize = 36; // Cell size (36x36)
const spacing = 4; // Spacing between cells

const gridContainer = document.querySelector(".grid-container");

// Set grid layout using whole pixel values
gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, ${cellSize}px)`;
gridContainer.style.gridTemplateRows = `repeat(${gridSize}, ${cellSize}px)`;
gridContainer.style.gap = `${spacing}px`;

// Clear any old grid items
gridContainer.innerHTML = "";

// Create the grid with sharp, integer pixel sizes
for (let i = 0; i < gridSize * gridSize; i++) {
    const cell = document.createElement("div");
    cell.classList.add("grid-item");
    cell.style.width = `${cellSize}px`;
    cell.style.height = `${cellSize}px`;
    gridContainer.appendChild(cell);
}


