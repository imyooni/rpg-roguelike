let selectedPieceValue = 0;
let selectedPieces = [];
let shopPieces = [];
let tooltip;
let gridSize = 8;

function isMobile() {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

document.addEventListener('contextmenu', (event) => {
    event.preventDefault(); 
});

document.addEventListener('DOMContentLoaded', () => {
 
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





// Define multiple spritesheets
const spritesheets = {
    numbers: new Image(),
    colors: new Image(),
    roman: new Image(),
    special: new Image(),
    zul: new Image(),
    // Add more spritesheets as needed
};

// Function to load all spritesheets
function loadSpritesheets() {
    const loadPromises = [
        new Promise((resolve) => {
            spritesheets.numbers.src = "./assets/Sprites/numbers.png";
            spritesheets.numbers.onload = resolve;
        }),
       new Promise((resolve) => {
            spritesheets.roman.src = "./assets/Sprites/roman.png";
            spritesheets.roman.onload = resolve;
        }),
        new Promise((resolve) => {
            spritesheets.colors.src = "./assets/Sprites/colors.png";
            spritesheets.colors.onload = resolve;
        }),
        new Promise((resolve) => {
            spritesheets.special.src = "./assets/Sprites/special.png";
            spritesheets.special.onload = resolve;
        }),
        new Promise((resolve) => {
            spritesheets.zul.src = "./assets/Sprites/zul.png";
            spritesheets.zul.onload = resolve;
        }),
        // Add more promises for additional spritesheets
    ];

    // Wait for all spritesheets to load before proceeding
    Promise.all(loadPromises).then(() => {
        // Once all spritesheets are loaded, generate the grid and shop pieces
    //    generateShopPieces();
        generateGridPieces();
    });
}

function generateGridPieces() {
    gridContainer.innerHTML = "";
    gridItems.length = 0; // Clear previous grid pieces

    function getRandomChoice() {
        return Math.random() < 0.80 ? 'normal' : 'special';
    }

    for (let i = 0; i < gridSize * gridSize; i++) {
        const cell = document.createElement("div");
        cell.classList.add("grid-item");
        cell.style.width = `${cellSize}px`;
        cell.style.height = `${cellSize}px`;
        cell.style.position = "relative";

        let pieceChoice = getRandomChoice()
        const canvas = document.createElement("canvas");
        canvas.width = cellSize;
        canvas.height = cellSize;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        let spriteKey;
        let points = 1;
        let pieceType;
        let enabled = true;
        let randomNumber;
        let spriteX;
        let spriteY; 
        let offsetX;
        let offsetY;

        if (pieceChoice === "normal") {
         pieceType = 'numbers'
         spriteKey = spritesheets.numbers
         randomNumber = Math.floor(Math.random() * 10) + 1;
        } else {
         let specialPiece = getRandomTypeByProbabilityWithDisableEffect()  
         let specialTypesList = ["blocked","yooni","bubble","shop","zul","shuffle","colors","roman"] 
         let specialIndex = getSpecialData(specialTypesList.indexOf(specialPiece))
         spriteKey = specialIndex[0];
         randomNumber = specialIndex[1];
         enabled = specialIndex[2];
         points = specialIndex[3];
         pieceType = specialPiece

         if (pieceType == 'roman') {
         points = 2   
         spriteKey = spritesheets.roman
         randomNumber = Math.floor(Math.random() * 9) + 1;
         } else if (pieceType == 'special') {
       
         } 

        }
        spriteX = (randomNumber - 1) * 36;
        spriteY = 0;
        offsetX = (cellSize - 37) / 2;
        offsetY = (cellSize - 37) / 2;

        // Use the characters spritesheet for grid items
        ctx.drawImage(spriteKey, spriteX, spriteY, 36, 36, offsetX, offsetY, 36, 36);

        cell.appendChild(canvas);
        gridContainer.appendChild(cell);

        gridItems.push({
            element: cell,
            canvas: canvas,
            enabled: enabled,
            points: 1,
            value: randomNumber,
            type: pieceType,
            isSelected: false,
        });
    }
}

function getSpecialData(index){
   let specialArray = [
    [spritesheets.special,1,false,0], // blocked 
    [spritesheets.special,2,true,2], // yooni
    [spritesheets.special,3,'hide',3], // bubble
    [spritesheets.special,4,true,0], // shop
    [spritesheets.zul,Math.floor(Math.random() * 3) + 1,true,0], // zul
    [spritesheets.special,5,true,0], // shuffle
    [spritesheets.colors,Math.floor(Math.random() * 9) + 1,true,2], // colors 
    [spritesheets.roman,Math.floor(Math.random() * 9) + 1,true,2], // roman
   ] 
  return specialArray[index]
}

function getRandomTypeByProbabilityWithDisableEffect() {
    let shuffleList = 0
    for (let i = 0; i < gridItems.length; i++) {
      if (gridItems[i].type === 'shuffle') {
        shuffleList += 1
        break
      }
    }
    const typesWithProbabilities = [
        { type: "colors", probability: 0.4, enabled: true},
        { type: "roman", probability: 0.2, enabled: true },
        { type: "blocked", probability: 0.1, enabled: true },
        { type: "bubble", probability: 0.1, enabled: true }, 
        { type: "yooni", probability: 0.05, enabled: true }, 
        { type: "shop", probability: 0.05, enabled: true },
        { type: "shuffle", probability: 0.04, enabled: shuffleList < 1},
        { type: "zul", probability: 0.02, enabled: true },
    ];
    const totalProbability = typesWithProbabilities.reduce((sum, item) => sum + item.probability, 0);
    if (totalProbability !== 1) {
        typesWithProbabilities.forEach(item => {
            item.probability /= totalProbability; 
        });
    }
    const randomValue = Math.random();
    let cumulativeProbability = 0;
    for (let i = 0; i < typesWithProbabilities.length; i++) {
        if (typesWithProbabilities[i].enabled) {
            cumulativeProbability += typesWithProbabilities[i].probability;
            if (randomValue < cumulativeProbability) {
                return typesWithProbabilities[i].type; 
            }
        }
    }
    return "blocked";
}

function generateShopPieces() {
    shopContainer.innerHTML = "";
    shopPieces.length = 0; // Clear previous shop pieces

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

        // Use the numbers spritesheet for shop items
        ctx.drawImage(spritesheets.numbers, spriteX, spriteY, 36, 36, offsetX, offsetY, 36, 36);

        cell.appendChild(shopCanvas);
        shopContainer.appendChild(cell);

        const shopItem = {
            element: cell,
            canvas: shopCanvas,
            enabled: true,
            points: 1,
            price: Math.floor(Math.random() * 5000) + 1,
            value: randomNumber,
            isSelected: false,
        };

        shopPieces.push(shopItem);

        // Add tooltip
        const tooltip = document.createElement("span");
        tooltip.classList.add("tooltip-text");
        tooltip.innerText = `$${shopItem.price}`;
        shopItem.element.appendChild(tooltip);
    }
}



// 🎮 Load all spritesheets before generating pieces
loadSpritesheets();
 
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
        if (!clickedItem && event.target.tagName === 'CANVAS') {
            clickedItem = event.target.closest('.grid-item, .shop-item');
        }
        if (!clickedItem) {
            return;
        }
        let gridItem = gridItems.find(item => item.element === clickedItem);
        let shopItem = shopPieces.find(item => item.element === clickedItem);
        if (gridItem) {
          //  console.log("Grid item clicked:", gridItem);
            handleGridClick(gridItem, clickedItem);
        } else if (shopItem) {
          //  console.log("Shop item clicked:", shopItem);
            handleShopClick(shopItem, clickedItem);
        } else {
          //  console.log("Item found but not recognized.");
        }
    });
    
    function handleGridClick(gridItem, element) {
        if (gridItem.enabled === false) {
         playAudio('/SFX/System_Piece_Disabled.ogg');  
         return
        } else if (gridItem.enabled === 'hide') {
         return
        }
        playAudio('/SFX/System_Selected_Piece.ogg');
        gridItem.isSelected = !gridItem.isSelected;
        element.classList.toggle('selected');
        if (tooltip) {
           tooltip.classList.remove("show")
           shopPieces.forEach(item => {
            if (item.isSelected) {
                item.element.classList.remove("selected");
                item.isSelected = false;
                item.element.querySelector(".tooltip-text").classList.remove("show");
            }
          });
        }
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
        tooltip = shopItem.element.querySelector(".tooltip-text");
        shopPieces.forEach(item => {
            if (item.isSelected) {
                item.element.classList.remove("selected");
                item.isSelected = false;
                item.element.querySelector(".tooltip-text").classList.remove("show");
            }
        });
        if (!alreadySelected) {
            shopItem.element.classList.add("selected");
            shopItem.isSelected = true;
            tooltip.classList.add("show"); // Show Tooltip
        } else {
            tooltip.classList.remove("show"); // Hide Tooltip if already selected
        }
    }
    

    function HandlePieceAction(piece) {
        if (selectedPieceValue === 10) {
            hideSelectedPieces();
            playAudio('/SFX/System_Money.ogg')
            playAudio('/SFX/System_Selected_ok.ogg')
        }
    }

 

    

    function hideSelectedPieces() {
        let totalPoints = 0;
        let romanSize = 0;
        let bubbles = 0
        selectedPieces.forEach(item => {
            item.canvas.classList.add("piece-fade-out");
            item.element.classList.add("green-flash");
            item.element.classList.remove("selected");
            item.enabled = "hide";
            item.type = null;
            totalPoints += item.points;
            bubbles += destroyNearbyBubble(gridItems.indexOf(item));
            item.element.addEventListener('animationend', function handleGreenFlashEnd(event) {
                if (event.animationName === 'green-flash') {
                    // Once the green-flash animation ends, remove the class
                    item.element.classList.remove("green-flash");
                    item.element.removeEventListener('animationend', handleGreenFlashEnd); // Clean up listener
                }
            });
        });
        for (let i = 0; i < gridItems.length; i++) { 
          if (gridItems[i].type === 'roman' && gridItems[i].enabled) {
            romanSize += 1
            updateRoman(i);
          }  
        } 
        if (romanSize > 0) {playAudio('/SFX/System_Roman_Update.ogg')}
        if (bubbles > 0) {playAudio('/SFX/System_Bubble_Pop.ogg')}
        updateMoneyDisplay(totalPoints * selectedPieces.length);
        selectedPieceValue = 0;
        selectedPieces = [];
    }
    

    function updateRoman(index) {
        let item = gridItems[index];
        item.canvas.classList.remove("piece-fade-in");
        if (item.type === 'roman' && item.enabled !== 'hide') {
            item.enabled = 'hide'; 
            item.canvas.classList.remove("piece-fade-in"); 
            item.canvas.classList.add("piece-fade-out");
            setTimeout(() => {
                const ctx = item.canvas.getContext("2d");
                ctx.clearRect(0, 0, item.canvas.width, item.canvas.height);
                let newValues = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(value => value !== item.value);
                const randomIndex = Math.floor(Math.random() * newValues.length);
                const newNumber = newValues[randomIndex];
                item.value = newNumber; 
                const spriteX = (newNumber - 1) * 36;
                const spriteY = 0;
                const offsetX = (item.canvas.width - 37) / 2;
                const offsetY = (item.canvas.height - 37) / 2;
                ctx.drawImage(spritesheets.roman, spriteX, spriteY, 36, 36, offsetX, offsetY, 36, 36);
                item.enabled = true;
                item.canvas.classList.remove("piece-fade-out");
                item.canvas.classList.add("piece-fade-in");
            }, 500); 
        }      
    }


    function destroyNearbyBubble(centerIndex) {
        let centerX = centerIndex % gridSize;
        let centerY = Math.floor(centerIndex / gridSize);
        let bubblesDestroyed = 0;
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                let newX = centerX + dx;
                let newY = centerY + dy;
                let newIndex = newY * gridSize + newX;
                if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
                    let bubble = gridItems[newIndex];
                    if (bubble.type === "bubble") {
                        bubble.type = null
                        bubble.canvas.classList.add("bubble-fade-out");
                        bubble.element.classList.add("bubble-flash");
                        bubblesDestroyed++;
                    }
                }
            }
        }
        return bubblesDestroyed; 
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
