

import * as pieceData from './assets/Scripts/piecesData.js';

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
let specialTypesList = [
    "blocked", "star", "bubble", "shop", "zul",
    "reroll", "colors", "roman", "bomb", "fire",
    "rainbow", "updown"];

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

        //   bgmSource.start();
        gainNode.gain.value = 0.5; // 50% volume
    }
}

document.body.addEventListener("click", playBGM, { once: true });

function setVolume(value) {
    if (gainNode) {
        gainNode.gain.value = value; // Value between 0 and 1
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const shopContainer = document.querySelector(".shop-grid");
    const gridContainer = document.querySelector(".grid-container");
    const reRollcanvas = document.createElement("canvas");

    gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, ${cellSize}px)`;
    gridContainer.style.gridTemplateRows = `repeat(${gridSize}, ${cellSize}px)`;
    gridContainer.style.gap = `${spacing}px`;

    shopContainer.style.gridTemplateColumns = `repeat(${3}, ${cellSize}px)`;
    shopContainer.style.gridTemplateRows = `repeat(${2}, ${cellSize}px)`;
    shopContainer.style.gap = `${spacing}px`;

    shopVocab()

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
            generatePiece(i, gridContainer, "grid-item", null, true)
        }
    }


    let audioContext;
    const audioBuffers = new Map(); // Store loaded audio buffers

    async function initAudio() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioContext.state === "suspended") {
            await audioContext.resume();
        }
    }

    // Function to load an audio file into memory
    async function loadAudio(filePath) {
        if (audioBuffers.has(filePath)) return; // Already loaded

        await initAudio();
        try {
            const response = await fetch(`./assets/Audio/${filePath}`);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            audioBuffers.set(filePath, audioBuffer);
        } catch (error) {
            console.error("Failed to load audio:", error);
        }
    }

    // Function to play an audio file
    async function playAudio(filePath) {
        await initAudio();

        // Load audio if it's not already in memory
        if (!audioBuffers.has(filePath)) {
            await loadAudio(filePath);
        }

        const buffer = audioBuffers.get(filePath);
        if (!buffer) return;

        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start(0);
    }




    // Unlock audio on first user interaction (needed for mobile)
    document.addEventListener("click", initAudio, { once: true });
    document.addEventListener("touchstart", initAudio, { once: true });




    function generateShopPieces() {
        shopContainer.innerHTML = "";
        for (let i = 0; i < 6; i++) {
            generatePiece(i, shopContainer, "shop-item", null, true)
        }
    }

    function updateReRollImage(ctx, reRollcanvas) {
        let spriteX = reRolls * 34;
        let spriteY = 0;
        let offsetX = 0;
        let offsetY = 0;
        ctx.clearRect(0, 0, reRollcanvas.width, reRollcanvas.height);
        ctx.drawImage(spritesheets.roll, spriteX, spriteY, 34, 64, offsetX, offsetY, 34, 64);
    }

    function createReroll() {
        if (!reRollcanvas) {
            reRollcanvas = document.createElement("canvas");
        }
        reRollButton = document.createElement("div"); // Assign globally
        reRollButton.classList.add("shuffle-item");

        Object.assign(reRollButton.style, {
            width: "34px",
            height: "64px",
            position: "absolute",
        });

        reRollcanvas.width = 34;
        reRollcanvas.height = 64;
        const ctx = reRollcanvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        updateReRollImage(ctx, reRollcanvas);

        reRollButton.addEventListener("click", function () {
            if (reRollButton.classList.contains("shake")) return;

            let emptySpaces = gridItems
                .map((piece, index) => (piece.enabled === "empty" ? index : null))
                .filter((index) => index !== null);

            if (reRolls <= 0 || emptySpaces.length === 0) {
                playAudio("/SFX/System_Piece_Disabled.ogg");
                reRollButton.classList.add("shake");
                reRollButton.addEventListener("animationend", () => {
                    reRollButton.classList.remove("shake");
                });
                return;
            }

            reRolls -= 1;
            playAudio("/SFX/System_ReRoll.ogg");
            reRollButton.classList.add("shake");

            emptySpaces.forEach((index) => {
                let piece = gridItems[index];
                piece.canvas.style.transition = "opacity 0.5s";
                piece.canvas.style.opacity = "1";
                generatePiece(index, gridContainer, "grid-item", null, true);
                piece.element.classList.add("shake");
            });

            reRollButton.addEventListener("animationend", () => {
                reRollButton.classList.remove("shake");
                emptySpaces.forEach((index) => gridItems[index].element.classList.remove("shake"));
            });

            updateReRollImage(ctx, reRollcanvas);
        });

        reRollButton.appendChild(reRollcanvas);

        let shuffleContainer = document.querySelector(".shuffle-item");
        if (shuffleContainer) {
            shuffleContainer.appendChild(reRollButton);
        } else {
            console.warn("Warning: .shuffle-item container not found.");
        }
    }

    function generatePiece(index, container, classId, fixedType = null, reroll = false) {
        let specialValue = (classId === 'shop-item') ? 0.60 : 0.25;

        function getRandomChoice() {
            return Math.random() < specialValue ? 'special' : 'normal';
        }

        let pieceChoice = (fixedType !== "normal" && fixedType !== null) ? "special" : getRandomChoice();
        let id = 0, price, pieceType = 'numbers', enabled = true, points = 1;
        let spriteKey, randomNumber, value;

        if (pieceChoice === "normal" || fixedType === "normal" || fixedType === "updown_numbers") {
            price = pieceData.Price(0);
            spriteKey = spritesheets.numbers;
            if (fixedType === "updown_numbers") {
                randomNumber = Math.floor(Math.random() * 9) + 1
            } else {
                randomNumber = getRandomNumber();
            }
            value = (randomNumber === 10) ? Math.floor(Math.random() * 9) + 1 : randomNumber;
        } else {
            let specialPiece = fixedType || getRandomTypeByProbabilityWithDisableEffect(classId, reroll);
            if (specialPiece) {
                let specialIndex = getSpecialData(specialTypesList.indexOf(specialPiece));
                [spriteKey, randomNumber, enabled, points] = specialIndex;
                pieceType = specialPiece;
                id = specialTypesList.indexOf(specialPiece) + 1;
                price = pieceData.Price(id);
                value = randomNumber;
            } else {
                // Default to normal piece if no special piece is selected
                price = pieceData.Price(0);
                spriteKey = spritesheets.numbers;
                randomNumber = Math.floor(Math.random() * 10) + 1;
                value = (randomNumber === 10) ? Math.floor(Math.random() * 9) + 1 : randomNumber;
            }
        }

        let spriteX = (randomNumber - 1) * 36;
        let spriteY = 0;
        let offsetX = (cellSize - 36) / 2;
        let offsetY = offsetX;

        let piecesList = (classId === "grid-item") ? gridItems : shopItems;
        let existingItem = piecesList[index];

        if (existingItem) {
            // Reuse existing canvas, update only necessary properties
            let ctx = existingItem.canvas.getContext("2d");
            ctx.clearRect(0, 0, cellSize, cellSize);
            ctx.drawImage(spriteKey, spriteX, spriteY, 36, 36, offsetX, offsetY, 36, 36);

            Object.assign(existingItem, { enabled, points, value, price, id, type: pieceType, isSelected: false });

            if (classId === "shop-item") {
                existingItem.enabled = true;
                let tooltip = existingItem.element.querySelector(".tooltip-text");
                if (tooltip) tooltip.innerText = `$${existingItem.price}`;
            }
        } else {
            // Create new element only if one doesn't exist
            const cell = document.createElement("div");
            cell.classList.add(classId);
            Object.assign(cell.style, { width: `${cellSize}px`, height: `${cellSize}px`, position: "relative" });

            const canvas = document.createElement("canvas");
            Object.assign(canvas.style, { transition: "opacity 0.5s", opacity: "0" });
            Object.assign(canvas, { width: cellSize, height: cellSize });

            const ctx = canvas.getContext("2d");
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(spriteKey, spriteX, spriteY, 36, 36, offsetX, offsetY, 36, 36);

            cell.appendChild(canvas);
            container.appendChild(cell);

            let pieceDataObj = { element: cell, canvas, id, enabled, points, price, value, type: pieceType, isSelected: false };
            requestAnimationFrame(() => (canvas.style.opacity = "1"));

            piecesList[index] = pieceDataObj;

            if (classId === "shop-item") {
                pieceDataObj.enabled = true;
                let tooltip = document.createElement("span");
                tooltip.classList.add("tooltip-text");
                tooltip.innerText = `$${pieceDataObj.price}`;
                cell.appendChild(tooltip);
            }
        }
    }


    function getRandomNumber() {
        const numbersProbabilities = [
            { type: 1, probability: 0.07 },
            { type: 2, probability: 0.08 },
            { type: 3, probability: 0.09 },
            { type: 4, probability: 0.10 },
            { type: 5, probability: 0.12 },
            { type: 6, probability: 0.13 },
            { type: 7, probability: 0.14 },
            { type: 8, probability: 0.11 },
            { type: 9, probability: 0.11 },
            { type: 10, probability: 0.05 }
        ];
        const totalProbability = numbersProbabilities.reduce((sum, item) => sum + item.probability, 0);
        if (totalProbability !== 1) {
            numbersProbabilities.forEach(item => {
                item.probability /= totalProbability;
            });
        }
        const randomValue = Math.random();
        let cumulativeProbability = 0;
        for (let i = 0; i < numbersProbabilities.length; i++) {
            cumulativeProbability += numbersProbabilities[i].probability;
            if (randomValue < cumulativeProbability) {
                return numbersProbabilities[i].type;
            }
        }
        return 10;
    }

    function getRandomTypeByProbabilityWithDisableEffect(classId, reroll = false) {
        let enabledPieces = new Array(specialTypesList.length).fill(true);
        let firePieces = 0
        if (classId === 'shop-item') {
            enabledPieces[2] = false;
            enabledPieces[5] = false;
        }
        if (reroll) {
            enabledPieces[6] = false;
        }
        for (let i = 0; i < gridItems.length; i++) {
            if (gridItems[i] === null || gridItems[i].enabled === 'empty') continue
            if (gridItems[i].type === 'shop') {
                enabledPieces[5] = false
            }
            if (gridItems[i].type === 'reroll') {
                enabledPieces[6] = false
            }
        }
        const typesWithProbabilities = [
            { type: "colors", probability: 0.33, enabled: enabledPieces[0] },
            { type: "roman", probability: 0.18, enabled: enabledPieces[1] },
            { type: "blocked", probability: 0.07, enabled: enabledPieces[2] },
            { type: "bubble", probability: 0.06, enabled: enabledPieces[3] },
            { type: "star", probability: 0.05, enabled: enabledPieces[4] },
            { type: "shop", probability: 0.05, enabled: enabledPieces[5] },
            { type: "reroll", probability: 0.04, enabled: enabledPieces[6] },
            { type: "zul", probability: 0.02, enabled: enabledPieces[7] },
            { type: "bomb", probability: 0.03, enabled: enabledPieces[8] },
            { type: "fire", probability: 0.04, enabled: enabledPieces[9] },
            { type: "rainbow", probability: 0.05, enabled: enabledPieces[10] },
            { type: "updown", probability: 0.03, enabled: enabledPieces[11] },
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
            [spritesheets.special, 7, 'hide', 0], // fire
            [spritesheets.special, 8, true, 0], // rainbow
            [spritesheets.special, 9, true, 0], // updown
        ]
        return specialArray[index]
    }



    document.addEventListener("click", function (event) {
        let clickedItem = event.target.closest(".grid-item, .shop-item");

        if (!clickedItem && event.target.tagName === "CANVAS") {
            clickedItem = event.target.closest(".grid-item, .shop-item");
        }
        if (!clickedItem) return;

        let gridItem = gridItems.find(item => item.element === clickedItem);
        let shopItem = shopItems.find(item => item.element === clickedItem);

        if (gridItem) {
            handleGridClick(gridItem, clickedItem);
        } else if (shopItem) {
            handleShopClick(shopItem, clickedItem);
        }
    });

    let pressTimer;
    document.addEventListener("mousedown", function (event) {
        let clickedItem = event.target.closest(".grid-item, .shop-item");
        if (!clickedItem && event.target.tagName === "CANVAS") {
            clickedItem = event.target.closest(".grid-item, .shop-item");
        }
        if (!clickedItem) return;

        pressTimer = setTimeout(() => {
            showTooltip(clickedItem, event); // Show tooltip after hold
        }, 300); // Adjust duration as needed
    });

    document.addEventListener("mouseup", function () {
        clearTimeout(pressTimer); // Cancel if released early
        if (toolTipItem === null) return
        hideTooltip(); // Hide tooltip on release
    });

    document.addEventListener("mouseleave", function () {
        clearTimeout(pressTimer); // Cancel if mouse leaves
        if (toolTipItem === null) return
        hideTooltip();
    });

    document.addEventListener("touchstart", function (event) {
        let clickedItem = event.target.closest(".grid-item, .shop-item");
        if (!clickedItem && event.target.tagName === "CANVAS") {
            clickedItem = event.target.closest(".grid-item, .shop-item");
        }
        if (!clickedItem) return;

        pressTimer = setTimeout(() => {
            showTooltip(clickedItem, event);
        }, 300);
    });

    document.addEventListener("touchend", function () {
        clearTimeout(pressTimer);
        if (toolTipItem === null) return
        hideTooltip();
    });

    // Tooltip Functions
    function wrapText(text, maxLength) {
        let words = text.split(" ");
        let line = "";
        let result = [];
        words.forEach(word => {
            if ((line + word).length > maxLength) {
                result.push(line.trim());
                line = word + " ";
            } else {
                line += word + " ";
            }
        });
        result.push(line.trim());
        return result.join("\n"); // Use "<br>" if inserting into HTML
    }

    let toolTipItem = null
    function showTooltip(element, event) {
        let desc = "";
        let gridItem = gridItems.find(item => item.element === element);
        let shopItem = shopItems.find(item => item.element === element)
        if (gridItem) {
            desc = pieceData.Description(gridItem.id);
            toolTipItem = [gridItem, gridItem.enabled]
            gridItem.enabled = 'hide';
        } else if (shopItem) {
            desc = pieceData.Description(shopItem.id);
            toolTipItem = [shopItem, shopItem.enabled]
            shopItem.enabled = 'hide';
        }
        if (!desc || desc.trim() === "") {
            return;
        }
        let secondaryBackground = document.querySelector(".secondary-background");
        let existingTooltip = document.querySelector(".tooltip");
        if (existingTooltip) {
            existingTooltip.remove();
        }
        let tooltip = document.createElement("div");
        tooltip.classList.add("tooltip");
        desc = wrapText(desc, 40); // Adjust maxLength as needed
        tooltip.innerText = desc; // Use innerHTML if using "<br>" instead of "\n"
        secondaryBackground.appendChild(tooltip);
        tooltip.style.position = "absolute";
        tooltip.style.left = "50%";
        tooltip.style.top = "18%";
        tooltip.style.transform = "translate(-50%, -50%)";
        tooltip.style.whiteSpace = "pre-wrap"; // Ensures \n works properly
        setTimeout(() => tooltip.classList.add("show"), 10);
        element.tooltipElement = tooltip;
    }

    function hideTooltip() {
        setTimeout(() => {
            if (toolTipItem !== null) {
                toolTipItem[0].enabled = toolTipItem[1]
                toolTipItem = null
            }
        }, 10);
        let tooltips = document.querySelectorAll(".tooltip");
        tooltips.forEach(tooltip => tooltip.remove());
    }


    function handleShopClick(shopItem, element) {
        if (shopItem.enabled === 'empty' || shopItem.enabled === 'hide') {
            return
        }
        for (let i = 0; i < gridItems.length; i++) {
            gridItems[i].element.classList.remove("selected");
            gridItems[i].isSelected = false
        }
        selectedPieceValue = 0;
        selectedPieces = [];
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
        const buyButton = document.querySelector('.buy-button');
        if (!alreadySelected) {
            shopItem.element.classList.add("selected");
            shopItem.isSelected = true;
            tooltip.classList.add("show");
            buyButton.pieceIndex = shopItems.indexOf(shopItem);
            buyButton.style.transition = "opacity 0.3s";
            buyButton.style.opacity = "1";
        } else {
            tooltip.classList.remove("show");
            buyButton.style.transition = "opacity 0.3s";
            buyButton.style.opacity = "0";
        }
    }

    //█===== 
    // shop //
    function shopVocab() {
        let vocabElement = document.querySelector('.shop-vocab');
        vocabElement.innerText = "Shop";
    }

    document.addEventListener("click", function (event) {
        const buyButton = document.querySelector('.buy-button');
        if (buyButton.classList.contains("shake")) return;
        if (event.target === buyButton) {
            if (buyButton.style.opacity != 1) return;
            let emptySpaces = gridItems
                .map((piece, index) => (piece.enabled === "empty" ? index : null))
                .filter((index) => index !== null);
            if (
                shopItems[buyButton.pieceIndex].enabled === 'empty' ||
                money < shopItems[buyButton.pieceIndex].price ||
                emptySpaces.length === 0
            ) {
                playAudio('/SFX/System_Piece_Disabled.ogg');
                buyButton.classList.add("shake");
                buyButton.addEventListener("animationend", () => {
                    buyButton.classList.remove("shake");
                });
                return;
            } else {
                const randomIndex = emptySpaces[Math.floor(Math.random() * emptySpaces.length)];
                const shopPiece = shopItems[buyButton.pieceIndex];
                gridItems[randomIndex].element.classList.add("shake");
                shopPiece.element.classList.add("shake");
                shopPiece.canvas.style.transition = "opacity 0.5s";
                shopPiece.canvas.style.opacity = "0";
                shopPiece.element.addEventListener("animationend", () => {
                    shopPiece.enabled = 'empty'
                })
                shopItems.forEach(item => {
                    if (item.isSelected) {
                        item.element.classList.remove("selected");
                        item.isSelected = false;
                        item.element.querySelector(".tooltip-text").classList.remove("show");
                    }
                });
                tooltip.classList.remove("show");
                buyButton.style.transition = "opacity 0.3s";
                buyButton.style.opacity = "0";
                let enabled;
                let spriteX = (shopPiece.value - 1) * 36;
                let spriteY = 0;
                let offsetX = (cellSize - 36) / 2;
                let offsetY = offsetX;
                let existingItem = gridItems[randomIndex];
                let spriteKey;
                let pieceData = getSpecialData(shopPiece.id - 1);
                if (shopPiece.id == 0) {
                    enabled = true;
                    spriteKey = spritesheets.numbers;
                } else {
                    spriteKey = pieceData[0];
                    enabled = pieceData[2];
                }
                let ctx = existingItem.canvas.getContext("2d");
                ctx.clearRect(0, 0, cellSize, cellSize);
                ctx.drawImage(spriteKey, spriteX, spriteY, 36, 36, offsetX, offsetY, 36, 36);
                Object.assign(existingItem, {
                    enabled: enabled,
                    id: shopPiece.id,
                    isSelected: false,
                    points: shopPiece.points,
                    price: 0,
                    type: shopPiece.type,
                    value: shopPiece.value
                });
                gridItems[randomIndex].element.classList.remove("shake");
                gridItems[randomIndex].canvas.style.transition = "opacity 0.5s";
                gridItems[randomIndex].canvas.style.opacity = "1";
                playAudio('/SFX/System_Update_Shop.ogg');
                updateMoneyDisplay(-shopItems[buyButton.pieceIndex].price);
            }
        }
    });

    function handleGridClick(gridItem, element) {
        if (gridItem.enabled === false) {
            disabledPiece(gridItem)
            return
        } else if (gridItem.enabled === 'hide' || gridItem.enabled === 'empty') {
            return
        } else if (gridItem.type === 'updown') {
            updown(gridItem);
            return
        } else if (gridItem.type === 'reroll') {
            updateRoll(gridItem)
            return
        } else if (gridItem.type === 'rainbow') {
            updateRainbow(gridItem)
            return
        } else if (gridItem.type === 'star' && selectedPieces.length == 0) {
            disabledPiece(gridItem)
            return
        }
        if (gridItem.type === 'shop') {
            updateShop(gridItem)
            return
        }
        if (gridItem.type === 'bomb') {
            bombExplode(gridItem)
            return
        }
        playAudio('/SFX/System_Selected_Piece.ogg');
        gridItem.isSelected = !gridItem.isSelected;
        element.classList.toggle('selected');
        const buyButton = document.querySelector('.buy-button');
        buyButton.style.transition = "opacity 0.3s";
        buyButton.style.opacity = "0";

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
            let numbersList = selectedPieces.some(n => n.type === "numbers");
            let colorsList = selectedPieces.some(n => n.type === "colors");
            let romanList = selectedPieces.some(n => n.type === "roman");
            if (gridItem.type === 'star') {
                selectedPieceValue = 10;
            } else if ((gridItem.type === 'roman' && colorsList) || (gridItem.type === 'colors' && romanList)) {
                selectedPieceValue = 11;
            } else if ((gridItem.type === 'numbers' && colorsList) || (gridItem.type === 'colors' && numbersList)) {
                selectedPieceValue = 11;
            } else if (gridItem.type === 'zul') {

            } else if (gridItem.type === 'colors') {
                if (selectedPieces.length > 0) {
                    if (selectedPieces[0].value === gridItem.value) {
                        selectedPieceValue = 10
                    } else {
                        selectedPieceValue = 11
                    }
                }
            } else {
                selectedPieceValue += gridItem.value;
            }
            selectedPieces.push(gridItem);
        } else {
            selectedPieces = selectedPieces.filter(item => item !== gridItem);
            if (gridItem.type === 'roman' || gridItem.type === 'numbers') {
                selectedPieceValue -= gridItem.value;
            }
        }
        HandlePieceAction(gridItem);
    }

    function HandlePieceAction(piece) {
        if (selectedPieceValue === 10) {
            hideSelectedPieces('success');
            playAudio('/SFX/System_Money.ogg');
            setTimeout(() => playAudio('/SFX/System_Selected_ok.ogg'), 100); // Add 100ms delay
        } else if (selectedPieceValue > 10) {
            hideSelectedPieces('wrong');
            playAudio('/SFX/System_Selected_Error.ogg');
        }
    }

    function hideSelectedPieces(mode) {
        let totalPoints = 0;
        let bubbles = 0;
        let colorFlash;

        selectedPieces.forEach(item => {
            if (mode === 'success') {
                colorFlash = ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.3)'];
            } else {
                colorFlash = ['rgba(250, 0, 0, 0.8)', 'rgba(255, 0, 0, 0.5)'];
            }

            item.canvas.style.transition = "opacity 0.5s";
            item.canvas.style.opacity = "0";
            playFlashAnimation(item.element, colorFlash[0], colorFlash[1]);
            item.element.classList.remove("selected");
            item.enabled = 'empty';

            if (mode === 'success') {
                totalPoints += item.points;
                bubbles += destroyNearbyBubble(gridItems.indexOf(item));
            } else {
                setTimeout(() => {
                    generatePiece(gridItems.indexOf(item), gridContainer, "grid-item", "blocked");
                    gridItems[gridItems.indexOf(item)].canvas.style.transition = "opacity 0.5s";
                    gridItems[gridItems.indexOf(item)].canvas.style.opacity = "1";
                }, 500);
            }
        });

        if (bubbles > 0) {
            totalPoints += bubbles;
            playAudio('/SFX/System_Bubble_Pop.ogg');
        }

        if (mode === 'success') {
            updateMoneyDisplay(totalPoints * selectedPieces.length);
            runFireAndRomanUpdates();
        }

        if (pieceBurned > 0) {
            playAudio('/SFX/System_Fire.ogg');
        }
        pieceBurned = 0;
        selectedPieceValue = 0;
        selectedPieces = [];
    }


    function updateRoll(piece) {
        reRolls += 1
        playAudio('/SFX/System_ReRoll.ogg');
        piece.enabled = 'empty';
        piece.canvas.style.transition = "opacity 0.5s";
        piece.canvas.style.opacity = "0";
        playFlashAnimation(piece.element, 'rgba(225, 150, 255, 0.8)', 'rgba(230, 129, 255, 0.5)')
        const ctx = reRollcanvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        updateReRollImage(ctx, reRollcanvas);
        reRollButton.classList.add("shake");
        reRollButton.addEventListener("animationend", () => {
            reRollButton.classList.remove("shake");
        });
    }

    function updateRainbow(item) {
        item.enabled = 'empty';
        item.canvas.style.transition = "opacity 0.5s";
        item.canvas.style.opacity = "0";
        playFlashAnimation(item.element, 'rgba(250, 225, 0, 0.8)', 'rgba(0, 255, 242, 0.5)')
        playAudio('/SFX/System_Colors.ogg');
        let updatedPieces = 0;
        const indexes = [...gridItems.keys()];
        for (let i = indexes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
        }
        for (let i = 0; i < indexes.length; i++) {
            let index = indexes[i];
            if (gridItems[index].enabled === 'empty') continue
            if (gridItems[index].type !== 'numbers') continue
            gridItems[index].element.classList.add("shake");
            gridItems[index].enabled = 'empty';
            gridItems[index].canvas.style.transition = "opacity 0.5s";
            gridItems[index].canvas.style.opacity = "0";
            let rainbowSelected = selectedPieces.indexOf(gridItems[index])
            if (rainbowSelected != -1) {
                selectedPieces[rainbowSelected].element.classList.remove("selected");
                selectedPieceValue -= gridItems[index].value;
                selectedPieces = selectedPieces.filter(item => item !== gridItems[index]);
            }
            setTimeout(() => {
                generatePiece(index, shopContainer, "grid-item", "colors");
                gridItems[index].element.classList.remove("shake");
                gridItems[index].canvas.style.transition = "opacity 0.5s";
                gridItems[index].canvas.style.opacity = "1";
            }, 500);
            let breakChance = Math.random() < 0.25;
            if (updatedPieces >= 6) break;
            if (updatedPieces > 0 && breakChance) break;
            updatedPieces += 1;
        }
    }


    function updown(item) {
        item.enabled = 'empty';
        item.canvas.style.transition = "opacity 0.5s";
        item.canvas.style.opacity = "0";
        playFlashAnimation(item.element, 'rgba(255, 172, 172, 0.8)', 'rgba(179, 255, 172, 0.8)')
        playAudio('/SFX/System_Updown.ogg');
        let updatedPieces = 0;
        const indexes = [...gridItems.keys()];
        for (let i = indexes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
        }
        for (let i = 0; i < indexes.length; i++) {
            let index = indexes[i];
            if (gridItems[index].enabled === 'empty') continue
            if (gridItems[index].type !== 'numbers') continue
            let color = Math.random() < 0.5;
            let animColor;
            if (color) {
             animColor = ['rgba(255, 172, 172, 0.8)','rgba(184, 78, 78, 0.5)']
            } else {
             animColor = ['rgba(179, 255, 172, 0.8)','rgba(96, 184, 78, 0.5)']
            }
            playFlashAnimation(gridItems[index].element, animColor[0], animColor[1])
            gridItems[index].element.classList.add("shake");
            gridItems[index].enabled = 'empty';
            gridItems[index].canvas.style.transition = "opacity 0.5s";
            gridItems[index].canvas.style.opacity = "0";
            let rainbowSelected = selectedPieces.indexOf(gridItems[index])
            if (rainbowSelected != -1) {
                selectedPieces[rainbowSelected].element.classList.remove("selected");
                selectedPieceValue -= gridItems[index].value;
                selectedPieces = selectedPieces.filter(item => item !== gridItems[index]);
            }
            setTimeout(() => {
                generatePiece(index, shopContainer, "grid-item", "updown_numbers");
                gridItems[index].element.classList.remove("shake");
                gridItems[index].canvas.style.transition = "opacity 0.5s";
                gridItems[index].canvas.style.opacity = "1";
            }, 500);
            let breakChance = Math.random() < 0.25;
            if (updatedPieces > 0 && breakChance) break;
            updatedPieces += 1;
        }
    }

    function bombExplode(item) {
        playAudio('/SFX/System_Explosion.ogg');
        item.enabled = 'empty';
        item.canvas.style.transition = "opacity 0.5s";
        item.canvas.style.opacity = "0";
        playFlashAnimation(item.element, 'rgba(250, 150, 0, 0.8)', 'rgba(255, 102, 0, 0.5)')
        let centerIndex = gridItems.indexOf(item)
        let centerX = centerIndex % gridSize;
        let centerY = Math.floor(centerIndex / gridSize);
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                let newX = centerX + dx;
                let newY = centerY + dy;
                let newIndex = newY * gridSize + newX;
                if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
                    let piece = gridItems[newIndex];
                    if (piece.enabled !== 'empty') {
                        let destroySelected = selectedPieces.indexOf(piece)
                        if (destroySelected != -1) {
                            selectedPieces[destroySelected].element.classList.remove("selected");
                            selectedPieceValue -= piece.value;
                            selectedPieces = selectedPieces.filter(item => item !== piece);
                        }
                        piece.enabled = 'empty';
                        piece.canvas.style.transition = "opacity 0.5s";
                        piece.canvas.style.opacity = "0";
                        playFlashAnimation(piece.element, 'rgba(250, 150, 0, 0.8)', 'rgba(255, 102, 0, 0.5)')
                    }
                }
            }
        }
    }


    let pieceBurned = 0
    function updateFire(item) {
        function getRandomChoice() {
            return Math.random() < 0.45 ? true : false;
        }
        let burnChance = getRandomChoice();
        if (!burnChance) return pieceBurned;
        playFlashAnimation(item.element, 'rgba(250, 150, 0, 0.8)', 'rgba(255, 102, 0, 0.5)');
        let centerIndex = gridItems.indexOf(item);
        let centerX = centerIndex % gridSize;
        let centerY = Math.floor(centerIndex / gridSize);
        let nonEmptyPieces = [];
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                let newX = centerX + dx;
                let newY = centerY + dy;
                let newIndex = newY * gridSize + newX;

                if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
                    let piece = gridItems[newIndex];
                    if (piece !== item && piece.enabled !== 'empty' && piece.type !== 'blocked' &&
                        piece.type !== 'fire' && selectedPieces.indexOf(piece) === -1) {
                        nonEmptyPieces.push(piece);
                    }
                }
            }
        }
        if (nonEmptyPieces.length > 0) {
            pieceBurned += 1;
            let randomPiece = nonEmptyPieces[Math.floor(Math.random() * nonEmptyPieces.length)];
            if (randomPiece.type === 'bomb') {
                bombExplode(randomPiece);
            } else {
                randomPiece.enabled = 'empty';
                randomPiece.canvas.style.transition = "opacity 0.5s";
                randomPiece.canvas.style.opacity = "0";
                randomPiece.isBurned = true;
                playFlashAnimation(randomPiece.element, 'rgba(250, 150, 0, 0.8)', 'rgba(255, 102, 0, 0.5)');
            }
        } else {
            item.enabled = 'empty';
            item.canvas.style.transition = "opacity 0.5s";
            item.canvas.style.opacity = "0";
            item.isBurned = true;
            playFlashAnimation(item.element, 'rgba(250, 150, 0, 0.8)', 'rgba(255, 102, 0, 0.5)');
            pieceBurned += 1;
        }
    }


    function updateRoman(index) {
        let item = gridItems[index];
        if (item.type === 'roman' && !item.isBurned && item.enabled !== 'hide' && item.enabled !== 'empty') {
            item.enabled = 'hide';
            item.canvas.style.transition = "opacity 0.3s";
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


    function runFireAndRomanUpdates() {
        for (let i = 0; i < gridItems.length; i++) {
            if (gridItems[i].type === 'fire' && gridItems[i].enabled !== 'empty') {
                updateFire(gridItems[i]);
            }
        }
        for (let i = 0; i < gridItems.length; i++) {
            if (gridItems[i].type === 'roman' && gridItems[i].enabled !== 'empty') {
                if (gridItems[i].isBurned) continue
                updateRoman(i);
            }
        }
    }


    function playFlashAnimation(element, color1, color2) {
        element.style.setProperty('--piece-color-start', color1);
        element.style.setProperty('--piece-color-mid', color2);
        element.classList.add('piece-flash');
        element.addEventListener("animationend", () => {
            element.classList.remove("piece-flash");
        });
    }

    function updateShop(item) {
        item.enabled = 'empty';
        item.canvas.style.transition = "opacity 0.5s";
        item.canvas.style.opacity = "0";
        playFlashAnimation(item.element, 'rgba(121, 250, 0, 0.8)', 'rgba(115, 255, 0, 0.5)')
        playAudio('/SFX/System_Update_Shop.ogg');
        shopItems.forEach(item => {
            if (item.isSelected) {
                item.element.classList.remove("selected");
                item.isSelected = false;
                item.element.querySelector(".tooltip-text").classList.remove("show");
            }
        });
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
                        bubble.enabled = 'empty';
                        bubble.canvas.style.transition = "opacity 0.5s";
                        bubble.canvas.style.opacity = "0";
                        playFlashAnimation(bubble.element, 'rgba(0, 250, 250, 0.8)', 'rgba(0, 204, 255, 0.5)')
                        bubblesDestroyed += bubble.points;
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

});