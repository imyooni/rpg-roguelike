
let selectedPieceValue = 0;
let selectedPieces = [];
let shopItems = [];
let tooltip;
let gridItems = [] //new Array(8*8).fill(null);
let gridSize = 8;
let cellSize = 36;
let spacing = 4;
let reRolls = 3;
let reRollButton;
let money = 0; //Math.floor(Math.random() * 9999999);

function isMobile() {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});

let audioContext, bgmSource, gainNode;

async function playBGM() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        gainNode = audioContext.createGain(); // Create volume control

        const response = await fetch('./assets/Audio/BGM/bgm001.ogg');
        const audioData = await response.arrayBuffer();
        const buffer = await audioContext.decodeAudioData(audioData);

        bgmSource = audioContext.createBufferSource();
        bgmSource.buffer = buffer;
        bgmSource.loop = true;

        bgmSource.connect(gainNode);
        gainNode.connect(audioContext.destination);

        bgmSource.start();
        gainNode.gain.value = 0.5; // 50% volume
    }
}

document.body.addEventListener("click", playBGM, { once: true });

// Example: Adjust volume dynamically
function setVolume(value) {
    if (gainNode) {
        gainNode.gain.value = value; // Value between 0 and 1
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const shopContainer = document.querySelector(".shop-grid");
    const gridContainer = document.querySelector(".grid-container");

    gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, ${cellSize}px)`;
    gridContainer.style.gridTemplateRows = `repeat(${gridSize}, ${cellSize}px)`;
    gridContainer.style.gap = `${spacing}px`;

    shopContainer.style.gridTemplateColumns = `repeat(${3}, ${cellSize}px)`;
    shopContainer.style.gridTemplateRows = `repeat(${2}, ${cellSize}px)`;
    shopContainer.style.gap = `${spacing}px`;

    const spritesheets = {
        roll: new Image(),
        numbers: new Image(),
        colors: new Image(),
        roman: new Image(),
        special: new Image(),
        zul: new Image(),
    };

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
            new Promise((resolve) => {
                spritesheets.roll.src = "./assets/Sprites/reRollButton.png";
                spritesheets.roll.onload = resolve;
            }),
        ];
        Promise.all(loadPromises).then(() => {
            generateShopPieces();
            generateGridPieces();
            createReroll();
        });
    }

    // 🎮 Load all spritesheets before generating pieces
    loadSpritesheets();

    function generateGridPieces() {
        gridContainer.innerHTML = ""
        for (let i = 0; i < gridSize * gridSize; i++) {
            generatePiece(i, gridContainer, "grid-item")
        }
    }


    const audioCache = {};
    function playAudio(filePath) {
        if (!audioCache[`./assets/Audio/${filePath}`]) {
            audioCache[`./assets/Audio/${filePath}`] = new Audio(`./assets/Audio/${filePath}`);
        }
        const audio = audioCache[`./assets/Audio/${filePath}`];
        audio.currentTime = 0;
        audio.play();
    }

    function generateShopPieces() {
        shopContainer.innerHTML = "";
        for (let i = 0; i < 6; i++) {
            generatePiece(i, shopContainer, "shop-item")
        }
    }

    function createReroll() {
        reRollButton = document.createElement("div");
        reRollButton.classList.add("shuffle-item");
        reRollButton.style.width = `34px`;
        reRollButton.style.height = `64px`;
        reRollButton.style.position = "absolute";
        const reRollcanvas = document.createElement("canvas");
        reRollcanvas.width = 34;
        reRollcanvas.height = 64;
        const ctx = reRollcanvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        reRollButton.addEventListener('click', function () {
            if (reRollButton.classList.contains("shake")) {
                return
            }
            let emptySpaces = []
            for (let index = 0; index < gridItems.length; index++) {
                const piece = gridItems[index];
                if (piece.enabled === 'empty') {
                    emptySpaces.push(index)
                }
            }
            if (reRolls <= 0 || emptySpaces.length <= 0) {
                playAudio('/SFX/System_Piece_Disabled.ogg');
                reRollButton.classList.add("shake");
                setTimeout(() => {
                    reRollButton.classList.remove("shake");
                }, 150);
                return
            }
            reRolls -= 1
            playAudio('/SFX/System_ReRoll.ogg');
            reRollButton.classList.add("shake");
            if (emptySpaces.length > 0) {
                for (let index = 0; index < emptySpaces.length; index++) {
                    const piece = gridItems[emptySpaces[index]];
                    piece.canvas.style.transition = "opacity 0.5s";
                    piece.canvas.style.opacity = "1";
                    generatePiece(emptySpaces[index], gridContainer, "grid-item")
                    piece.element.classList.add("shake");
                }
            }
            setTimeout(() => {
                reRollButton.classList.remove("shake");
                for (let index = 0; index < emptySpaces.length; index++) {
                    const piece = gridItems[emptySpaces[index]];
                    piece.element.classList.remove("shake");
                }
            }, 150);
            let spriteX = reRolls * 34;
            let spriteY = 0;
            let offsetX = 0;
            let offsetY = 0;
            ctx.clearRect(0, 0, reRollcanvas.width, reRollcanvas.height);
            ctx.drawImage(spritesheets.roll, spriteX, spriteY, 34, 64, offsetX, offsetY, 34, 64);
        });
        let spriteX = reRolls * 34;
        let spriteY = 0;
        let offsetX = 0;
        let offsetY = 0;
        ctx.drawImage(spritesheets.roll, spriteX, spriteY, 34, 64, offsetX, offsetY, 34, 64);
        reRollButton.appendChild(reRollcanvas);
        document.querySelector(".shuffle-item").appendChild(reRollButton);
    }


    function generatePiece(index, container, classId) {
        let specialValue;
        if (classId === 'shop-item') {
            specialValue = 0.60;
        } else {
            specialValue = 0.80;
        }
        function getRandomChoice() {
            return Math.random() < specialValue ? 'normal' : 'special';
        }
        let pieceChoice = getRandomChoice();
        let spriteKey, points = 1, pieceType, enabled = true, randomNumber, spriteX, spriteY, offsetX, value, offsetY;
        if (pieceChoice === "normal") {
            pieceType = 'numbers';
            spriteKey = spritesheets.numbers;
            randomNumber = Math.floor(Math.random() * 10) + 1;
            if (randomNumber === 10) {
                value = Math.floor(Math.random() * 9) + 1;
            } else {
                value = randomNumber;
            }
        } else {
            let specialPiece = getRandomTypeByProbabilityWithDisableEffect(classId);
            if (specialPiece === null) {
                pieceType = 'numbers';
                spriteKey = spritesheets.numbers;
                randomNumber = Math.floor(Math.random() * 10) + 1;
                if (randomNumber === 10) {
                    value = Math.floor(Math.random() * 9) + 1;
                } else {
                    value = randomNumber;
                }
            } else {
                let specialTypesList = [
                    "blocked", "star", "bubble", "shop", "zul", 
                    "reroll", "colors", "roman", "bomb"];
                let specialIndex = getSpecialData(specialTypesList.indexOf(specialPiece));
                spriteKey = specialIndex[0];
                randomNumber = specialIndex[1];
                enabled = specialIndex[2];
                points = specialIndex[3];
                pieceType = specialPiece;
                if (pieceType == 'roman') {
                    points = 2;
                    spriteKey = spritesheets.roman;
                    randomNumber = Math.floor(Math.random() * 9) + 1;
                }
                value = randomNumber;
            }
        }
        spriteX = (randomNumber - 1) * 36;
        spriteY = 0;
        offsetX = (cellSize - 36) / 2;
        offsetY = (cellSize - 36) / 2;
        let piecesListIndex
        if (classId === "grid-item") {
            piecesListIndex = gridItems[index]
        } else {
            piecesListIndex = shopItems[index]
        }
        if (piecesListIndex) {
            let existingItem;
            if (classId === "grid-item") {
                existingItem = gridItems[index]
            } else {
                existingItem = shopItems[index]
            }
            let ctx = existingItem.canvas.getContext("2d");
            ctx.clearRect(0, 0, cellSize, cellSize);
            ctx.drawImage(spriteKey, spriteX, spriteY, 36, 36, offsetX, offsetY, 36, 36);
            existingItem.enabled = enabled;
            existingItem.points = points;
            existingItem.value = value;
            existingItem.type = pieceType;
            existingItem.isSelected = false;
        } else {
            const cell = document.createElement("div");
            cell.classList.add(classId);
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            cell.style.position = "relative";
            const canvas = document.createElement("canvas");
            canvas.style.transition = "opacity 0.5s";
            canvas.style.opacity = "0";
            canvas.width = cellSize;
            canvas.height = cellSize;
            const ctx = canvas.getContext("2d");
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(spriteKey, spriteX, spriteY, 36, 36, offsetX, offsetY, 36, 36);
            cell.appendChild(canvas);
            container.appendChild(cell);
            const pieceData = {
                element: cell,
                canvas: canvas,
                enabled: enabled,
                points: points,
                price: Math.floor(Math.random() * 5000) + 1,
                value: value,
                type: pieceType,
                isSelected: false,
            };
            requestAnimationFrame(() => {
                canvas.style.transition = "opacity 0.5s";
                canvas.style.opacity = "1";
            });
            if (classId === "grid-item") {
                gridItems[index] = pieceData
            } else if (classId === "shop-item") {
                shopItems[index] = pieceData
                const tooltip = document.createElement("span");
                tooltip.classList.add("tooltip-text");
                tooltip.innerText = `$${pieceData.price}`;
                pieceData.element.appendChild(tooltip);
            }
        }
    }

    function getRandomTypeByProbabilityWithDisableEffect(classId) {
        let enabledPieces = new Array(9).fill(true);
        if (classId === 'shop-item') {
            enabledPieces[2] = false;
        }
        for (let i = 0; i < gridItems.length; i++) {
            if (gridItems[i] === null) continue
            if (gridItems[i].type === 'reroll') {
                enabledPieces[6] = false
                break
            }
        }
        const typesWithProbabilities = [
            { type: "colors", probability: 0.4, enabled: enabledPieces[0] },
            { type: "roman", probability: 0.2, enabled: enabledPieces[1] },
            { type: "blocked", probability: 0.1, enabled: enabledPieces[2] },
            { type: "bubble", probability: 0.07, enabled: enabledPieces[3] },
            { type: "star", probability: 0.05, enabled: enabledPieces[4] },
            { type: "shop", probability: 0.05, enabled: enabledPieces[5] },
            { type: "reroll", probability: 0.04, enabled: enabledPieces[6] },
            { type: "zul", probability: 0.02, enabled: enabledPieces[7] },
            { type: "bomb", probability: 0.03, enabled: enabledPieces[8] },
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
        return null;
    }
    function getSpecialData(index) {
        let specialArray = [
            [spritesheets.special, 1, false, 0], // blocked 
            [spritesheets.special, 2, true, 2], // star
            [spritesheets.special, 3, 'hide', 3], // bubble
            [spritesheets.special, 4, true, 0], // shop
            [spritesheets.zul, Math.floor(Math.random() * 3) + 1, true, 5], // zul
            [spritesheets.special, 5, true, 0], // shuffle
            [spritesheets.colors, Math.floor(Math.random() * 9) + 1, true, 3], // colors 
            [spritesheets.roman, Math.floor(Math.random() * 9) + 1, true, 2], // roman
            [spritesheets.special, 6, true, 0], // bomb
        ]
        return specialArray[index]
    }


    function handleShopClick(shopItem, element) {
        if (shopItem.enabled === 'empty') {
            return
        }
        playAudio('/SFX/System_Selected_Piece.ogg');
        const alreadySelected = shopItem.isSelected;
        tooltip = shopItem.element.querySelector(".tooltip-text");
        shopItems.forEach(item => {
            if (item.isSelected) {
                item.element.classList.remove("selected");
                item.isSelected = false;
                item.element.querySelector(".tooltip-text").classList.remove("show");
            }
        });
        if (!alreadySelected) {
            shopItem.element.classList.add("selected");
            shopItem.isSelected = true;
            tooltip.classList.add("show");
        } else {
            tooltip.classList.remove("show");
        }
    }

    document.addEventListener('click', function (event) {
        let clickedItem = event.target.closest('.grid-item, .shop-item');
        if (!clickedItem && event.target.tagName === 'CANVAS') {
            clickedItem = event.target.closest('.grid-item, .shop-item');
        }
        if (!clickedItem) {
            return;
        }
        let gridItem = gridItems.find(item => item.element === clickedItem);
        let shopItem = shopItems.find(item => item.element === clickedItem);
        if (gridItem) {
            handleGridClick(gridItem, clickedItem);
        } else if (shopItem) {
            handleShopClick(shopItem, clickedItem);
        }
    });

    function disabledPiece(item) {
        let oldState = item.enabled;
        playAudio('/SFX/System_Piece_Disabled.ogg');
        item.enabled = 'hide'
        item.element.classList.add("shake");
        setTimeout(() => {
            item.element.classList.remove("shake");
            item.enabled = oldState;
        }, 150);
    }

    function handleGridClick(gridItem, element) {
        if (gridItem.enabled === false) {
            disabledPiece(gridItem)
            return
        } else if (gridItem.enabled === 'hide' || gridItem.enabled === 'empty') {
            return
        } else if (gridItem.type === 'star' && selectedPieces.length == 0) {
            disabledPiece(gridItem)
            return
        }
        if (gridItem.type === 'shop') {
            updateShop(gridItem)
            return
        }
        playAudio('/SFX/System_Selected_Piece.ogg');
        gridItem.isSelected = !gridItem.isSelected;
        element.classList.toggle('selected');
        if (tooltip) {
            tooltip.classList.remove("show")
            shopItems.forEach(item => {
                if (item.isSelected) {
                    item.element.classList.remove("selected");
                    item.isSelected = false;
                    item.element.querySelector(".tooltip-text").classList.remove("show");
                }
            });
        }
        if (gridItem.isSelected) {
            selectedPieces.push(gridItem);
            if (gridItem.type === 'star') {
             selectedPieceValue = 10;
            } else {
             selectedPieceValue += gridItem.value;
            }
        } else {
            selectedPieces = selectedPieces.filter(item => item !== gridItem);
            selectedPieceValue -= gridItem.value;
        }
        HandlePieceAction(gridItem);
    }

    function HandlePieceAction(piece) {
        if (selectedPieceValue === 10) {
            hideSelectedPieces('success');
            playAudio('/SFX/System_Money.ogg');
            setTimeout(() => {
                playAudio('/SFX/System_Selected_ok.ogg');
            }, 10);
        } else if (selectedPieceValue > 10) {
            hideSelectedPieces('wrong');
            playAudio('/SFX/System_Selected_Error.ogg');
        }
    }

    function hideSelectedPieces(mode) {
        let totalPoints = 0;
        let bubbles = 0
        let colorFlash
        selectedPieces.forEach(item => {
            if (mode === 'success') {
                colorFlash = "gold-flash"
            } else {
                colorFlash = "red-flash"
            }
            item.canvas.style.transition = "opacity 0.5s";
            item.canvas.style.opacity = "0";
            item.element.classList.add(colorFlash);
            item.element.classList.remove("selected");
            item.enabled = 'empty';
            if (mode === 'success') {
                totalPoints += item.points;
                bubbles += destroyNearbyBubble(gridItems.indexOf(item));
            }
            item.element.addEventListener('animationend', function handleGreenFlashEnd(event) {
                if (event.animationName === colorFlash) {
                    item.element.classList.remove(colorFlash);
                    item.element.removeEventListener('animationend', handleGreenFlashEnd);
                }
            });
        });
        if (bubbles > 0) { playAudio('/SFX/System_Bubble_Pop.ogg') }
        if (mode === 'success') {
            updateMoneyDisplay(totalPoints * selectedPieces.length);
            for (let i = 0; i < gridItems.length; i++) {
                if (gridItems[i].type === 'roman' && gridItems[i].enabled) {
                    updateRoman(i);
                }
            }
        }
       // selectedPieces.forEach(item => {
       //     item.canvas.classList.remove("piece-fade-in");
       // });
        selectedPieceValue = 0;
        selectedPieces = [];
    }

    function updateShop(item) {
        item.enabled = 'empty';
        item.canvas.style.transition = "opacity 0.5s";
        item.canvas.style.opacity = "0";
        playAudio('/SFX/System_Update_Shop.ogg');
        for (let i = 0; i < shopItems.length; i++) {
            shopItems[i].element.classList.add("shake");
            shopItems[i].enabled = 'empty';
            shopItems[i].canvas.style.transition = "opacity 0.5s";
            shopItems[i].canvas.style.opacity = "0";
            setTimeout(() => {
                generatePiece(i, shopContainer, "shop-item")
                shopItems[i].element.classList.remove("shake");
                shopItems[i].canvas.style.transition = "opacity 0.5s";
                shopItems[i].canvas.style.opacity = "1";
            }, 500);
        }
    }

    function updateRoman(index) {
        let item = gridItems[index];
        item.canvas.classList.remove("piece-fade-in");
        if (item.type === 'roman' && item.enabled !== 'hide') {
            item.enabled = 'hide';
            item.canvas.style.transition = "opacity 0.5s";
            item.canvas.style.opacity = "0";
            setTimeout(() => {
                const ctx = item.canvas.getContext("2d");
                ctx.clearRect(0, 0, item.canvas.width, item.canvas.height);
                let newValues = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(value => value !== item.value);
                const randomIndex = Math.floor(Math.random() * newValues.length);
                const newNumber = newValues[randomIndex];
                item.value = newNumber;
                const spriteX = (newNumber - 1) * 36;
                const spriteY = 0;
                const offsetX = (item.canvas.width - 36) / 2;
                const offsetY = (item.canvas.height - 36) / 2;
                ctx.drawImage(spritesheets.roman, spriteX, spriteY, 36, 36, offsetX, offsetY, 36, 36);
                item.enabled = true;
                item.canvas.style.transition = "opacity 0.5s";
                item.canvas.style.opacity = "1";
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
                    if (bubble.type === "bubble" && bubble.enabled !== 'empty') {
                        selectedPieces.push(bubble)
                        bubble.enabled = 'empty';
                        bubble.canvas.style.transition = "opacity 0.5s";
                        bubble.canvas.style.opacity = "0";
                        bubble.element.classList.add("bubble-flash");
                        bubblesDestroyed++;
                    }
                }
            }
        }
        return bubblesDestroyed;
    }

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
