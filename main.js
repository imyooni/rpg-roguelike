let selectedPieceValue = 0;
let selectedPieces = [];
let shopPieces = [];

function isMobile() {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

document.addEventListener('contextmenu', (event) => {
    event.preventDefault(); 
});

document.addEventListener('DOMContentLoaded', () => {
    const gridSize = 8;
    const cellSize = 36;
    const spacing = 4;

    const shopContainer = document.querySelector(".shop-grid");
    const gridContainer = document.querySelector(".grid-container");

    gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, ${cellSize}px)`;
    gridContainer.style.gridTemplateRows = `repeat(${gridSize}, ${cellSize}px)`;
    gridContainer.style.gap = `${spacing}px`;
    
    shopContainer.style.gridTemplateColumns = `repeat(${3}, ${cellSize}px)`;
    shopContainer.style.gridTemplateRows = `repeat(${2}, ${cellSize}px)`;
    shopContainer.style.gap = `${spacing}px`;

    let gridItems = []; 

    const spritesheet = new Image();
    spritesheet.src = "./assets/Sprites/numbers.png";


 
    spritesheet.onload = function() {

        shopContainer.innerHTML = "";
        for (let i = 0; i < 6; i++) {
            const cell = document.createElement("div");
            cell.classList.add("shop-item");
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            cell.style.position = "relative";
            const shopCanvas = document.createElement("canvas");
            shopCanvas.width = cellSize;
            shopCanvas.height = cellSize;
            const ctx = shopCanvas.getContext("2d");
            ctx.imageSmoothingEnabled = false;
            const randomNumber = Math.floor(Math.random() * 9) + 1;
            const spriteX = (randomNumber - 1) * 36;
            const spriteY = 0;
            const offsetX = (cellSize - 36) / 2;
            const offsetY = (cellSize - 36) / 2;
            ctx.drawImage(spritesheet, spriteX, spriteY, 36, 36, offsetX, offsetY, 36, 36);
            cell.appendChild(shopCanvas);
            shopContainer.appendChild(cell);
            shopPieces.push({
                element: cell,
                canvas: shopCanvas,
                enabled: true,
                points: 1,
                price: Math.floor(Math.random() * 5000) + 1,
                value: randomNumber,
                isSelected: false,
            });
        }


        gridContainer.innerHTML = "";
        for (let i = 0; i < gridSize * gridSize; i++) {
            const cell = document.createElement("div");
            cell.classList.add("grid-item");
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            cell.style.position = "relative";
            const canvas = document.createElement("canvas");
            canvas.width = cellSize;
            canvas.height = cellSize;
            const ctx = canvas.getContext("2d");
            ctx.imageSmoothingEnabled = false;
            const randomNumber = Math.floor(Math.random() * 9) + 1;
            const spriteX = (randomNumber - 1) * 36;
            const spriteY = 0;
            const offsetX = (cellSize - 37) / 2;
            const offsetY = (cellSize - 37) / 2;
            ctx.drawImage(spritesheet, spriteX, spriteY, 36, 36, offsetX, offsetY, 36, 36);
            cell.appendChild(canvas);
            gridContainer.appendChild(cell);
            gridItems.push({
                element: cell,
                canvas: canvas,
                enabled: true,
                points: 1,
                value: randomNumber,
                isSelected: false,
            });
        }

        shopPieces.forEach(item => {
            item.element.classList.add("tooltip"); // Add tooltip class to the element
        
            const tooltip = document.createElement("span");
            tooltip.classList.add("tooltip-text");
            tooltip.innerText = `$${item.price}`; // Set the text dynamically
        
            item.element.appendChild(tooltip); // Append the tooltip to the item
        });
        
 
    };


 
    const audioCache = {};
    function playAudio(filePath) {
        if (!audioCache[`./assets/Audio/${filePath}`]) {
            audioCache[`./assets/Audio/${filePath}`] = new Audio(`./assets/Audio/${filePath}`);
        }
        const audio = audioCache[`./assets/Audio/${filePath}`];
        audio.currentTime = 0; 
        audio.play();
    }
    
    document.addEventListener('click', function(event) {
        let clickedItem = event.target.closest('.grid-item, .shop-item');
    
        // If clicking on a canvas inside a grid-item or shop-item, find the correct parent
        if (!clickedItem && event.target.tagName === 'CANVAS') {
            clickedItem = event.target.closest('.grid-item, .shop-item');
        }
    
        if (!clickedItem) {
            return;
        }
    
    
        // Check if it's a grid item
        let gridItem = gridItems.find(item => item.element === clickedItem);
        
        // Check if it's a shop item
        let shopItem = shopPieces.find(item => item.element === clickedItem);
    
        if (gridItem) {
            console.log("Grid item clicked:", gridItem);
            handleGridClick(gridItem, clickedItem);
        } else if (shopItem) {
            console.log("Shop item clicked:", shopItem);
            handleShopClick(shopItem, clickedItem);
        } else {
            console.log("Item found but not recognized.");
        }
    });
    
    function handleGridClick(gridItem, element) {
        if (!gridItem.enabled) return;
    
        playAudio('/SFX/System_Selected_Piece.ogg');
        gridItem.isSelected = !gridItem.isSelected;
        element.classList.toggle('selected');
    
        if (gridItem.isSelected) {
            selectedPieces.push(gridItem);
            selectedPieceValue += gridItem.value;
        } else {
            selectedPieces = selectedPieces.filter(item => item !== gridItem);
            selectedPieceValue -= gridItem.value;
        }
    
        HandlePieceAction(gridItem);
    }
    
    function handleShopClick(shopItem, element) {
        playAudio('/SFX/System_Selected_Piece.ogg');
        const alreadySelected = shopItem.isSelected; 
        for (let i = 0; i < shopPieces.length; i++) {
            if (shopPieces[i].isSelected) {
                shopPieces[i].element.classList.remove("selected");
                shopPieces[i].isSelected = false;
                break; // ✅ Stops the loop immediately
            }
        }
        if (!alreadySelected) {
            shopItem.element.classList.add("selected");
            shopItem.isSelected = true;
        } else {
            if (isMobile()) {
                hideTooltips(); // Hide tooltips when the shop grid is clicked on mobile
            }
        }
    }
    
    // Function to hide tooltips
    function hideTooltips() {
        document.querySelectorAll(".tooltip-text").forEach(tooltip => {
            tooltip.style.visibility = "hidden";
            tooltip.style.opacity = "0";
        });
    }

    function HandlePieceAction(piece) {
        if (selectedPieceValue === 10) {
            hideSelectedPieces();
            playAudio('/SFX/System_Money.ogg')
            playAudio('/SFX/System_Selected_ok.ogg')
        }
    }

  function hideSelectedPieces() {
    let totalPoints = 0
    selectedPieces.forEach(item => {
        item.element.classList.add("green-flash"); 
        item.element.classList.remove("selected")
        item.enabled = false;
        totalPoints += item.points
        setTimeout(() => {
          //  item.element.style.opacity = 0;
            item.canvas.style.opacity = 0
            item.element.classList.remove("green-flash"); 
        }, 500);
    });
    updateMoneyDisplay(totalPoints*selectedPieces.length);
    selectedPieceValue = 0;
    selectedPieces = [];
}

    

    let money = 0 //Math.floor(Math.random() * 9999999);
    updateMoneyDisplay(0)

    function updateMoneyDisplay(value) {
        let startMoney = money;
        let targetMoney = money + value;
        let duration = 300; 
        let steps = 20; 
        let stepTime = duration / steps;
        let currentStep = 0;
        function animateStep() {
            currentStep++;
            let progress = currentStep / steps;
            let easingProgress = 1 - Math.pow(1 - progress, 3);
            let animatedValue = Math.floor(startMoney + (targetMoney - startMoney) * easingProgress);
            renderMoney(animatedValue);
            if (currentStep < steps) {
                setTimeout(animateStep, stepTime);
            } else {
             money = targetMoney; 
            }
        }
        animateStep();
    }
    
    // Function to update the money display
    function renderMoney(amount) {
        const moneyDisplay = document.getElementById('money-display');
        moneyDisplay.innerHTML = '';
        const numberStr = amount.toString().padStart(7, '0'); 
        for (let i = 0; i < numberStr.length; i++) {
            const digit = numberStr[i];
            const digitElement = document.createElement('span');
            const digitWidth = 22;
            digitElement.style.backgroundPosition = `-${digit * digitWidth}px 0`;
            moneyDisplay.appendChild(digitElement);
        }
    }

});
