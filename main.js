document.addEventListener('DOMContentLoaded', () => {
    const gridSize = 8; // Grid size (8x8)
    const cellSize = 36; // Cell size (36x36)
    const spacing = 4; // Spacing between cells
    
    const gridContainer = document.querySelector(".grid-container");

    // Set grid layout using whole pixel values
    gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, ${cellSize}px)`;
    gridContainer.style.gridTemplateRows = `repeat(${gridSize}, ${cellSize}px)`;
    gridContainer.style.gap = `${spacing}px`;

    // Create an array to hold the grid items
    let gridItems = [];

    // Load the spritesheet image
    const spritesheet = new Image();
    spritesheet.src = "./assets/Sprites/numbers.png"; // Replace with your actual spritesheet path

    spritesheet.onload = function() {
        // Clear any old grid items
        gridContainer.innerHTML = "";

        // Create the grid with sharp, integer pixel sizes
        for (let i = 0; i < gridSize * gridSize; i++) {
            const cell = document.createElement("div");
            cell.classList.add("grid-item");
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            cell.style.position = "relative"; // Add relative positioning to the grid item

            // Create a canvas element inside each grid item
            const canvas = document.createElement("canvas");
            canvas.width = cellSize;
            canvas.height = cellSize;

            const ctx = canvas.getContext("2d");

            // Disable image smoothing for pixelated effect
            ctx.imageSmoothingEnabled = false;

            // Generate a random number between 1 and 9
            const randomNumber = Math.floor(Math.random() * 9) + 1;

            // Calculate the position of the sprite on the spritesheet
            const spriteX = (randomNumber - 1) * 36; // Adjust for 36x36 sprite size
            const spriteY = 0; // All sprites are on the first row (adjust if your spritesheet is arranged differently)

            // Draw the selected sprite from the spritesheet onto the canvas, centered in the grid cell
            const offsetX = (cellSize - 37) / 2; // Horizontal offset to center the sprite
            const offsetY = (cellSize - 37) / 2; // Vertical offset to center the sprite

            // Draw the sprite centered within the 36x36 grid cell
            ctx.drawImage(spritesheet, spriteX, spriteY, 36, 36, offsetX, offsetY, 36, 36);

            // Now append the canvas (which contains the centered sprite) to the grid item
            cell.appendChild(canvas);

            // Append the cell to the grid container
            gridContainer.appendChild(cell);

            // Add the grid item object to the array, initialized with properties
            gridItems.push({
                element: cell,
                canvas: canvas,
                isSelected: false, // To track if the cell is selected
             //   gif: null // To store the GIF element if any
            });
        }
    };

    // Add click event listener to gridContainer
    gridContainer.addEventListener('click', function(event) {
        const clickedItem = event.target.closest('.grid-item'); // Get the grid item, regardless of whether canvas or other part is clicked

        // Check if the clicked item is a valid grid item
        if (clickedItem) {
            const index = gridItems.findIndex(item => item.element === clickedItem);

            if (index !== -1) {
                const gridItem = gridItems[index];

                // Toggle the selection state
                gridItem.isSelected = !gridItem.isSelected;


                // Optionally, toggle a border (or any other style changes) on the clicked item
                clickedItem.classList.toggle('selected');
            }
        }
    });

    // Function to update the money display (to be called after setting up)
    let money = 100; // Initial money value

    function updateMoney(value) {
        money = value;
        const moneyElement = document.getElementById("money-value");
        if (moneyElement) {
            moneyElement.textContent = money;
        } else {
            console.error("Money element not found.");
        }
    }

    // Call updateMoney to set the initial value
    updateMoney(money);

    // Optionally, you can add a function to increase money after some action
    function increaseMoney(amount) {
        updateMoney(money + amount);
    }

    // For example, increase money by 10 after 2 seconds
    setTimeout(() => increaseMoney(10), 2000);
});

