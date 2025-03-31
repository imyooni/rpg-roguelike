

import * as pieceData from './assets/Scripts/piecesData.js';
import * as languageData from './assets/Scripts/languageData.js';

let scene = 'intro';
let language = 'eng';

let selectedPieceValue = 0;
let selectedPieces = [];
let shopItems = [];
let tooltip;
let gridItems = []
let gridSize = 8;
let cellSize = 36;
let spacing = 4;
let reRolls = 2;
let reRollButton;
let money = 0; //Math.floor(Math.random() * 9999999);
let dayCount = 1;
let gamePaused = false;
let goalPoints = 250;
let calendar = [2025, 1, 1]
let week = new Array(31).fill(languageData.dayEffects(0, language))
let books = []
let effects = [];
let specialTypesList = [
    "blocked", "star", "bubble", "shop", "zul",
    "reroll", "colors", "roman", "bomb", "fire",
    "rainbow", "updown", "multi", "ice"];

function isMobile() {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

document.addEventListener('contextmenu', (event) => {
   // event.preventDefault();
});

document.addEventListener('dragstart', (event) => {
    event.preventDefault();
});


function changeHiddenState(elements, mode) {
    if (mode === "hide") {
        elements.forEach(element => element.classList.add('hidden'));
    } else {
        elements.forEach(element => element.classList.remove('hidden'));
    }
}

let audioContext;
let globalGainNode;
const audioBuffers = new Map();
let bgmSource = null;

async function initAudio(globalVolume = 0.75) {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        globalGainNode = audioContext.createGain();
        globalGainNode.connect(audioContext.destination);
        globalGainNode.gain.value = globalVolume; // Default global volume
    }
    if (audioContext.state === "suspended") {
        await audioContext.resume();
    }
}

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

async function playAudio(filePath, volume = 1) {
    await initAudio();
    if (!audioBuffers.has(filePath)) {
        await loadAudio(filePath);
    }
    const buffer = audioBuffers.get(filePath);
    if (!buffer) return;

    const source = audioContext.createBufferSource();
    source.buffer = buffer;

    // Create a separate gain node for this sound
    const soundGainNode = audioContext.createGain();
    soundGainNode.gain.value = volume; // Set individual volume

    // Connect the source -> individual gain -> global gain -> output
    source.connect(soundGainNode);
    soundGainNode.connect(globalGainNode);

    source.start(0);
}

async function playBGM(song, volume = 0.5) {
    await loadAudio(`BGM/${song}`); // Load and store buffer
    const buffer = audioBuffers.get(`BGM/${song}`);
    if (!buffer) return;

    // Stop any existing BGM
    if (bgmSource) {
        bgmSource.stop();
    }

    // Create new source and gain node for BGM
    bgmSource = audioContext.createBufferSource();
    bgmSource.buffer = buffer;
    bgmSource.loop = true;

    const bgmGainNode = audioContext.createGain();
    bgmGainNode.gain.value = volume; // Set BGM volume

    // Connect BGM source -> individual BGM gain -> global gain -> output
    bgmSource.connect(bgmGainNode);
    bgmGainNode.connect(globalGainNode);

    bgmSource.start();
}

function setGlobalVolume(volume) {
    if (globalGainNode) {
        globalGainNode.gain.value = volume;
    }
}

function stopBGM() {
    if (bgmSource) {
        bgmSource.stop();
        bgmSource = null;
    }
}

function playFlashAnimation(element, color1, color2) {
    element.classList.remove('element-flash');
    void element.offsetWidth;
    element.style.setProperty('--element-color-start', color1);
    element.style.setProperty('--element-color-mid', color2);
    element.classList.add('element-flash');
    element.addEventListener("animationend", () => {
        element.classList.remove("element-flash");
    }, { once: true });
}


const spritesheets = {
    dayEffects: new Image(),
    reRollButton: new Image(),
    numbers: new Image(),
    colors: new Image(),
    roman: new Image(),
    special: new Image(),
    zul: new Image(),
    bomb: new Image(),
};

function loadSpritesheets() {
    const spritePromises = Object.keys(spritesheets).map((key) => {
        return new Promise((resolve) => {
            spritesheets[key].src = `./assets/Sprites/${key}.png`;
            spritesheets[key].onload = resolve;
        });
    });
}

// 🎮 Load all spritesheets before generating pieces
loadSpritesheets();

//███████████//
//   INTRO   //
//███████████//
document.addEventListener('DOMContentLoaded', () => {
    const intro = document.querySelector('.intro-background');
    if (intro) intro.classList.remove('hidden');
});

document.addEventListener("click", function () {
    const logo = document.querySelector('.logo');
    if (!logo || logo.done) return;
    logo.classList.remove('hidden');
    setTimeout(() => {
        logo.style.opacity = "1";
    }, 100);
    logo.addEventListener("transitionend", function () {
        if (!logo.done) {
            playAudio('/SFX/System_Intro.ogg', 0.2);
            logo.done = true;
        }
    }, { once: true });
});

const gameTitle = document.querySelector('.gameTitle');
const gameLanguage = document.querySelector('.gameLanguage');
document.addEventListener("click", function () {
    const logo = document.querySelector('.logo');
    const intro = document.querySelector('.intro-background');
    const secondaryBackground = document.querySelector('.secondary-background');
    const twitchIcon = document.querySelector('.twitchIcon');
    const youtubeIcon = document.querySelector('.youtubeIcon');
    if (scene === 'intro' && logo.done) {
        setTimeout(() => {
            logo.style.opacity = "0";
        }, 100);
        logo.addEventListener("transitionend", function () {
            intro.style.opacity = "0";
            intro.addEventListener("transitionend", function () {
                intro.remove();
            }, { once: true });

            setTimeout(() => {
                gameTitle.style.opacity = "1";
            }, 100);
            secondaryBackground.classList.remove('hidden');
            twitchIcon.classList.remove('hidden');
            youtubeIcon.classList.remove('hidden');
            gameTitle.classList.remove('hidden');
            gameLanguage.classList.remove('hidden');
            scene = 'title'
            createNewGame()
            logo.remove();
        }, { once: true });
    }
});

const twitchIcon = document.querySelector('.twitchIcon');
twitchIcon.addEventListener('click', function () {
    playAudio('/SFX/System_Selected_Piece.ogg');
    window.open('https://www.twitch.tv/Zuljanim', '_blank');
});

const youtubeIcon = document.querySelector('.youtubeIcon');
youtubeIcon.addEventListener('click', function () {
    playAudio('/SFX/System_Selected_Piece.ogg');
    window.open('https://www.youtube.com/@jooyeonkim1774', '_blank');
});

let languageIcon = document.querySelector('.gameLanguage');

// Add event listener to the language icon
languageIcon.addEventListener('click', () => {
    // If opacity is not 1 (meaning the transition is ongoing), return and prevent further clicks
    if (parseFloat(window.getComputedStyle(languageIcon).opacity) !== 1) return;
    playAudio('/SFX/System_Selected_Piece.ogg');
    language = (language === 'eng') ? 'kor' : 'eng';
    languageIcon.style.opacity = 0;
    languageIcon.style.transition = 'background-image 0.2s ease-in-out, opacity 0.2s ease-in-out';
    setTimeout(() => {
        languageIcon.style.backgroundImage = language === 'eng'
            ? "url('./assets/Sprites/ENG.png')"
            : "url('./assets/Sprites/KOR.png')";
    }, 50);
    setTimeout(() => {
        languageIcon.style.opacity = 1;
    }, 200);
    updateNewGameText();
});

//███████████████//
//   NEW GAME    //
//███████████████//

const newGameVocab = document.querySelector('.newGame-vocab');
newGameVocab.addEventListener('click', function (event) {
    if (scene !== 'title') return
    if (scene === 'game') return
    playAudio('/SFX/System_Ok.ogg');
    playFlashAnimation(event.currentTarget, 'rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.49)');
    const elementsToHide = [twitchIcon, youtubeIcon, gameTitle, gameLanguage];
    elementsToHide.forEach(element => element.classList.add('hidden'));
    setTimeout(() => {
        newGameVocab.style.opacity = "0";
    }, 100);
    scene = 'game'
    newGameVocab.addEventListener("transitionend", function () {
        newGameVocab.classList.add('hidden')
        createWeeks()
        // startGame()
        // playBGM("bgm004.ogg", 0.35)
    }, { once: true });
});

function createNewGame() {
    if (!newGameVocab) return;
    newGameVocab.classList.remove('hidden');
    let newGameText = newGameVocab.querySelector('.newGame-text');
    if (!newGameText) {
        newGameText = document.createElement('div');
        newGameText.classList.add('newGame-text');
        newGameVocab.appendChild(newGameText);
    }
    newGameText.textContent = languageData.vocab(language).newGameVocab;
}

function updateNewGameText() {
    const newGameText = document.querySelector('.newGame-text');
    if (newGameText) {
        newGameText.textContent = languageData.vocab(language).newGameVocab;
    }
}

//███████████//
//   WEEKS   //
//███████████//
const weeksContainer = document.querySelector(".weeks-container");
const currentYear = document.querySelector(".currentYear");
const currentMonth = document.querySelector(".currentMonth");
const continueVocab = document.querySelector('.continue-vocab');
const moneyBorder = document.querySelector('.money-border');
const moneySprite = document.querySelector('.money-sprite');
const goalVocab = document.querySelector('.goal-vocab');
const dayDescContainer = document.querySelector('.dayDesc');
const booksBorder = document.querySelector('.books-border');

function createdayDesc(container) {
   // if (!container) return;
   // let dayDate = week[calendar[2]-1]
    let iconIndex = week[calendar[2]-1][0]
    let name = week[calendar[2]-1][1]
    let desc = week[calendar[2]-1][2]
    //let iconIndex = 0
    //if (dayDate > 0) {
    // iconIndex = dayDate 
    //} 
   // let dayData = languageData.dayEffects(dayDate, language);
    // Ensure the container has the right class
    container.classList.add("dayDesc");
    container.style.position = "absolute";

    // Check if canvas already exists, else create it
    let canvas = container.querySelector("canvas");
    if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.width = 24;
        canvas.height = 24;
        canvas.style.position = "relative";
        container.appendChild(canvas);
    }

    // Draw icon from sprite sheet
    const ctx = canvas.getContext("2d");
    const columns = 10;
    let index = iconIndex
    let spriteX = (index % columns) * 24;
    let spriteY = Math.floor(index / columns) * 24;
    ctx.clearRect(0, 0, 24, 24);
    ctx.drawImage(spritesheets.dayEffects, spriteX, spriteY, 24, 24, 0, 0, 24, 24);

    // Reuse or create name element
    let dayName = container.querySelector(".dayDesc-name");
    if (!dayName) {
        dayName = document.createElement("div");
        dayName.classList.add("dayDesc-name");
        container.appendChild(dayName);
    }
    dayName.textContent = name;

    // Reuse or create description element
    let dayDesc = container.querySelector(".dayDesc-text");
    if (!dayDesc) {
        dayDesc = document.createElement("div");
        dayDesc.classList.add("dayDesc-text");
        container.appendChild(dayDesc);
    }
    dayDesc.innerHTML = desc;
}

document.addEventListener('keydown', function (event) {
    if (event.key === "8") {
        week[0] = Math.floor(Math.random() * 10) + 1
        updateEffectIcons(0)
        createdayDesc(dayDescContainer)
        playAudio('/SFX/System_Selected_Piece.ogg');
    }
});



function createWeeks() {
    weeksContainer.style.gridTemplateColumns = `repeat(7, 44px)`;
    weeksContainer.style.gridTemplateRows = `repeat(5, 56px)`;
    weeksContainer.style.gap = `1px`;
    weeksContainer.innerHTML = "";
    let columns = 10;


    week[1] = 1
    week[30] = 11

    for (let i = 0; i <= 34; i++) {
        const cell = document.createElement("div");
        cell.classList.add("weeks-item");
        cell.style.position = "relative";

        if (i < 31) {
            if (calendar[2] == i + 1) {
                cell.style.backgroundColor = `#ffd700`;
            }
            cell.textContent = i + 1;
            if (week[i][0] !== 0) {
                const border = document.createElement("div");
                border.classList.add("dayBorder");
                cell.appendChild(border);
            }
            if (week[i][0] !== 0) {
                const canvas = document.createElement("canvas");
                canvas.width = 24;
                canvas.height = 24;
                canvas.style.position = "absolute";
                canvas.style.top = "56%";
                canvas.style.left = "55%";
                canvas.style.transform = "translate(-50%, -50%)";
                cell.appendChild(canvas);
                const ctx = canvas.getContext("2d");

                let index = week[i];
                let spriteX = (index % columns) * 24;
                let spriteY = Math.floor(index / columns) * 24;
                if (spritesheets.dayEffects.complete) {
                    ctx.clearRect(0, 0, 24, 24);
                    ctx.drawImage(spritesheets.dayEffects, spriteX, spriteY, 24, 24, 0, 0, 24, 24);
                } else {
                    spritesheets.dayEffects.onload = () => {
                        ctx.clearRect(0, 0, 24, 24);
                        ctx.drawImage(spritesheets.dayEffects, spriteX, spriteY, 24, 24, 0, 0, 24, 24);
                    };
                }
            }
        } else {
            cell.style.backgroundColor = "#9f8b75";
        }

        weeksContainer.appendChild(cell);
    }
    let containerList = [
        currentYear, currentMonth, weeksContainer, moneyBorder,
        moneySprite, goalVocab, continueVocab, dayDescContainer, booksBorder]
    changeHiddenState(containerList, "show");
  //  moneyBorder.style.transform = `translate(-68%, -1075%)`;
  //  moneyBorder.style.borderRadius = "0px 10px 10px 0px";
    containerList.forEach(element => {
        element.style.transition = 'opacity 0.3s ease-out'
    });
    createContinue();
    createCalendar();
    createGoal();
    updateMoneyDisplay(0);
    createdayDesc(dayDescContainer)
    setTimeout(() => {
        containerList.forEach(element => {
            element.style.opacity = "1"
        });
        document.querySelectorAll(".weeks-item").forEach((item) => {
            item.style.opacity = "1";
        });
    }, 10);
}


function updateEffectIcons(i) {
    let columns = 10
    const cell = weeksContainer.children[i];
    if (!cell) return;
    let border = cell.querySelector(".dayBorder");
    if (!border) {
        border = document.createElement("div");
        border.classList.add("dayBorder");
        cell.appendChild(border);
    }
    let canvas = cell.querySelector("canvas");
    if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.width = 24;
        canvas.height = 24;
        canvas.style.position = "absolute";
        canvas.style.top = "50%";
        canvas.style.left = "50%";
        canvas.style.transform = "translate(-50%, -50%)";
        cell.appendChild(canvas);
    }
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 24, 24);
    if (week[i] !== null) {
        let index = week[i];
        let spriteX = (index % columns) * 24;
        let spriteY = Math.floor(index / columns) * 24;
        ctx.drawImage(spritesheets.dayEffects, spriteX, spriteY, 24, 24, 0, 0, 24, 24);
    }
}


function createContinue() {
    const continueText = document.createElement('div');
    continueText.classList.add('continue-text');
    continueText.textContent = languageData.vocab(language).continue;
    continueVocab.appendChild(continueText);
}

continueVocab.addEventListener('click', function (event) {
    playAudio('/SFX/System_Ok.ogg');
    playFlashAnimation(event.currentTarget, 'rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.49)');

    let containerList = [
        currentYear, currentMonth, weeksContainer, moneyBorder,
        moneySprite, goalVocab, continueVocab, dayDescContainer, booksBorder
    ];
    containerList.forEach(element => {
        element.style.transition = 'opacity 0.3s ease-out';
    });

    setTimeout(() => {
        containerList.forEach(element => {
            element.style.opacity = "0";
        });
        document.querySelectorAll(".weeks-item").forEach((item) => {
            item.style.opacity = "0";
        });

        continueVocab.addEventListener("transitionend", function () {
            continueVocab.classList.add('hidden');
            changeHiddenState(containerList, "hide");

            // 🔴 Second setTimeout: Runs 500ms (0.5s) after the first setTimeout finishes
            setTimeout(() => {
                startGame()
                playBGM("bgm004.mp3", 0.35)  
                // Place your additional logic here
            }, 300);

        }, { once: true });

    }, 10);
});





function createCalendar() {
    if (!currentYear) return;
    currentYear.classList.remove('hidden');
    let currentYearText = currentYear.querySelector('.calendar-text');
    if (!currentYearText) {
        currentYearText = document.createElement('div');
        currentYearText.classList.add('calendar-text');
        currentYear.appendChild(currentYearText);
    }
    if (language === "eng") {
        currentYearText.textContent = `${calendar[0]}`;
    } else {
        currentYearText.textContent = `${calendar[0]}년`;
    }


    if (!currentMonth) return;
    currentMonth.classList.remove('hidden');
    let currentMonthText = currentMonth.querySelector('.calendar-text');
    if (!currentMonthText) {
        currentMonthText = document.createElement('div');
        currentMonthText.classList.add('calendar-text');
        currentMonth.appendChild(currentMonthText);
    }
    currentMonthText.textContent = `${languageData.months([calendar[1], calendar[2]], language)}`;
}




function updateMoneyDisplay(value) {
    // Ensure target money does not go below 0
    let startMoney = money;
    let targetMoney = Math.max(0, money + value);  // Prevent going below 0
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
            money = targetMoney;  // Update the actual money value
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

const goalText = document.createElement('div');
const pointsText = document.createElement('div');
function createGoal() {
    goalText.classList.add('goal');
    goalText.textContent = languageData.vocab(language).goal;;  // First word "goal" in gold color
    pointsText.classList.add('points');
    pointsText.textContent = `$${goalPoints}`;  // Points required in white color
    goalVocab.appendChild(goalText);
    goalVocab.appendChild(pointsText);
    const endDayText = document.createElement('div');
    endDayText.classList.add('endDay-text');
    endDayText.textContent = languageData.vocab(language).endDay;
    endDayVocab.appendChild(endDayText);
    const dayCountText = document.createElement('div');
    dayCountText.classList.add('dayCount-text');
    dayCountText.textContent = `${languageData.vocab(language).day} ${dayCount}`;
    dayCountVocab.appendChild(dayCountText);
}

function updateGoalPoints(newPoints) {
    goalPoints = newPoints;  // Update the variable
    pointsText.textContent = `$${goalPoints}`; // Update the displayed text
}


//███████████//
//   GAME    //
//███████████//

const shopContainer = document.querySelector(".shop-grid");
const gridContainer = document.querySelector(".grid-container");
const reRollcanvas = document.createElement("canvas");
const endDayVocab = document.querySelector('.endDay-vocab');
const gameTimeContainer = document.querySelector('.gameTime');
const endayConfirmationVocab = document.querySelector('.endayConfirmation-vocab');
const endayConfirmationYes = document.querySelector('.endayConfirmation-yes');
const endayConfirmationNo = document.querySelector('.endayConfirmation-no');
const dayCountVocab = document.querySelector('.dayCount-vocab');
const shopBorder = document.querySelector('.shop-border');
const shopVocab = document.querySelector('.shop-vocab');
const buyButton = document.querySelector('.buy-button');

const reRollItem = document.querySelector('.reroll-item');
const pauseBackground = document.querySelector('.pause-background');


function showGameElements() {

    let containerList = [
        gameTimeContainer, moneyBorder, moneySprite, shopContainer, shopBorder, shopVocab,buyButton,
        gridContainer, reRollcanvas, endDayVocab,dayCountVocab, pauseBackground,
        reRollItem, endayConfirmationVocab, endayConfirmationYes, endayConfirmationNo, 
        goalVocab, booksBorder
    ];
    changeHiddenState(containerList, "show");
  //  moneyBorder.style.transform = `translate(-68%, -1075%)`;
  //  moneyBorder.style.borderRadius = "0px 10px 10px 0px";
    containerList.forEach(element => {
        element.style.transition = 'opacity 0.3s ease-out'
    });
    setTimeout(() => {
        containerList.forEach(element => {
            if (element.className !== "buy-button") {
              element.style.opacity = "1"
            } 
        });
    }, 10);


}
function startGame() {
    gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, ${cellSize}px)`;
    gridContainer.style.gridTemplateRows = `repeat(${gridSize}, ${cellSize}px)`;
    gridContainer.style.gap = `${spacing}px`;

    shopContainer.style.gridTemplateColumns = `repeat(${3}, ${cellSize}px)`;
    shopContainer.style.gridTemplateRows = `repeat(${2}, ${cellSize}px)`;
    shopContainer.style.gap = `${spacing}px`;


  
    generateShopPieces();
    generateGridPieces();
    createReroll();
    shopVocab()
    showGameElements()




    let gameTime = 15 * 60; // 15 minutes in seconds
    const gameTimeDisplay = document.getElementById('gameTimeDisplay');
    let gamePaused = false;
    let freezeTime = 0; 
    
   
    function updateDisplay() {
        const minutes = Math.floor(gameTime / 60);
        const seconds = gameTime % 60;
        gameTimeDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    updateDisplay();
    const timerInterval = setInterval(updateGameTime, 1000);
    function updateGameTime() {
        if (gamePaused || freezeTime > 0) return;
        if (gameTime > 0) {
            gameTime--; 
            updateDisplay();
        } else {
            clearInterval(timerInterval);
            gameTimeDisplay.textContent = "00:00";
        }
    }
    
    function freezeTimer(duration) {
        freezeTime += duration; // Add freeze duration to the current freeze time
        
        // Add "freeze" class to indicate the freeze visually
        gameTimeContainer.classList.add("freeze"); 
    
        let freezeInterval = setInterval(() => {
            freezeTime--; // Decrease freeze time
    
            // Once the freeze time runs out
            if (freezeTime <= 0) {
                clearInterval(freezeInterval); // Stop the interval
    
                // Remove the "freeze" class to end the visual freeze indication
                gameTimeContainer.classList.remove("freeze");
            }
        }, 1000);
    }
    
    function restartTimer(newTime) {
        gameTime = newTime;
        updateGameTime(); 
    }


    // █ refresh shop (testing)
    document.addEventListener('keydown', function (event) {
        if (event.key === "8") {
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
    });

    function generateGridPieces() {
        gridContainer.innerHTML = ""
        for (let i = 0; i < gridSize * gridSize; i++) {
            generatePiece(i, gridContainer, "grid-item", null, true)
        }
    }

    function showPauseBackground() {
        let pauseBg = document.querySelector('.pause-background');

        // If the element does not exist, create it
        if (!pauseBg) {
            pauseBg = document.createElement('div');
            pauseBg.classList.add('pause-background');
            document.body.appendChild(pauseBg);
        }

        // Make it visible and enable interaction blocking
        pauseBg.style.display = 'block';
        pauseBg.style.pointerEvents = 'auto'; // Block interactions with elements underneath
    }

    function hidePauseBackground() {
        const pauseBg = document.querySelector('.pause-background');
        if (pauseBg) {
            pauseBg.style.display = 'none';
            pauseBg.style.pointerEvents = 'none'; // Allow interactions again
        }
    }

    function generateShopPieces() {
        shopContainer.innerHTML = "";
        for (let i = 0; i < 6; i++) {
            generatePiece(i, shopContainer, "shop-item", null, true)
        }
    }

    function updateReRollImage(ctx, reRollcanvas) {
        let index
        if (reRolls >= 5) {
            index = 5
        } else {
            index = reRolls
        }
        let spriteX = index * 34;
        let spriteY = 0;
        let offsetX = 0;
        let offsetY = 0;
        ctx.clearRect(0, 0, reRollcanvas.width, reRollcanvas.height);
        ctx.drawImage(spritesheets.reRollButton, spriteX, spriteY, 34, 67, offsetX, offsetY, 34, 67);
    }

    function createReroll() {
        if (!reRollcanvas) {
            reRollcanvas = document.createElement("canvas");
        }
        reRollButton = document.createElement("div"); 
        reRollButton.classList.add("reroll-item");

        Object.assign(reRollButton.style, {
            width: "34px",
            height: "67px",
            position: "absolute",
        });

        reRollcanvas.width = 34;
        reRollcanvas.height = 67;
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

        let shuffleContainer = document.querySelector(".reroll-item");
        if (shuffleContainer) {
            shuffleContainer.appendChild(reRollButton);
        } else {
            console.warn("Warning: .reroll-item container not found.");
        }
    }

    function generatePiece(index, container, classId, fixedType = null, reroll = false, fixedValue = null) {
        let specialValue = (classId === 'shop-item') ? 0.60 : 0.25;
        function getRandomChoice() {
            return Math.random() < specialValue ? 'special' : 'normal';
        }
        let pieceChoice = (fixedType !== "normal" && fixedType !== null) ? "special" : getRandomChoice();
        let id = 0, price, pieceType = 'numbers', enabled = true, points = 1;
        let spriteKey, randomNumber, value, desc = "", isBurned = false;
        if (pieceChoice === "normal" || fixedType === "numbers" || fixedType === "updown_numbers") {
            spriteKey = spritesheets.numbers;
            if (fixedType === "updown_numbers") {
                randomNumber = Math.floor(Math.random() * 9) + 1
            } else if (fixedValue !== null) {
                randomNumber = fixedValue
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
                if (fixedValue !== null) {
                    randomNumber = fixedValue
                }
                if (specialPiece === "bomb" && randomNumber === 3) {
                    enabled = 'hide';
                }
                value = randomNumber;
            } else {
                spriteKey = spritesheets.numbers;
                if (fixedValue !== null) {
                    randomNumber = fixedValue
                } else {
                    randomNumber = Math.floor(Math.random() * 10) + 1;
                }
                value = (randomNumber === 10) ? Math.floor(Math.random() * 9) + 1 : randomNumber;
            }
        }
        if (pieceType === "bomb") {
            desc = `${pieceType}${randomNumber}`
        } else if (pieceType === "numbers" && randomNumber === 10) {
            points = 2
            desc = "numbers2"
        } else {
            desc = pieceType
        }
        price = calculatePrice(pieceData.price(desc), [2, 6], 0.1)
        let columns = 10;
        let spriteX = ((randomNumber - 1) % columns) * cellSize;
        let spriteY = Math.floor((randomNumber - 1) / columns) * cellSize;
        let piecesList = (classId === "grid-item") ? gridItems : shopItems;
        let existingItem = piecesList[index];
        if (existingItem) {
            let ctx = existingItem.canvas.getContext("2d");
            existingItem.canvas.style.transition = "none";
            existingItem.canvas.style.opacity = "0";
            existingItem.element.classList.remove("shake", "element-flash");
            ctx.clearRect(0, 0, cellSize, cellSize);
            ctx.drawImage(spriteKey, spriteX, spriteY, 36, 36, 0, 0, 36, 36);
            Object.assign(existingItem, { enabled, points, value, price, id, desc, type: pieceType, isSelected: false, isBurned: false });
            requestAnimationFrame(() => {
                existingItem.canvas.style.transition = "opacity 0.5s";
                existingItem.canvas.style.opacity = "1";
            });
            if (classId === "shop-item") {
                existingItem.enabled = true;
                let tooltip = existingItem.element.querySelector(".tooltip-text");
                if (tooltip) {
                    tooltip.innerText = existingItem.price === 0 ? languageData.vocab(language).free : `$${existingItem.price}`;
                    tooltip.style.color = existingItem.price === 0 ? '#ffe600' : '#acd468';
                }
            }
        } else {
            const cell = document.createElement("div");
            cell.classList.add(classId);
            Object.assign(cell.style, { width: `${cellSize}px`, height: `${cellSize}px`, position: "relative" });
            const canvas = document.createElement("canvas");
            Object.assign(canvas.style, { transition: "opacity 0.5s", opacity: "0" });
            Object.assign(canvas, { width: cellSize, height: cellSize });
            const ctx = canvas.getContext("2d");
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(spriteKey, spriteX, spriteY, 36, 36, 0, 0, 36, 36);
            cell.appendChild(canvas);
            container.appendChild(cell);
            let pieceDataObj = { element: cell, canvas, id, desc, enabled, points, price, value, type: pieceType, isSelected: false, isBurned: false };
            requestAnimationFrame(() => (canvas.style.opacity = "1"));
            piecesList[index] = pieceDataObj;
            if (classId === "shop-item") {
                pieceDataObj.enabled = true;
                let tooltip = document.createElement("span");
                tooltip.classList.add("tooltip-text");
                if (pieceDataObj.price === 0) {
                    tooltip.innerText = languageData.vocab(language).free;
                    tooltip.style.color = '#ffe600'
                } else {
                    tooltip.innerText = `$${pieceDataObj.price}`;
                    tooltip.style.color = '#acd468'
                }
                cell.appendChild(tooltip);
            }
        }
    }

    function calculatePrice(price, minMax, probabilityToFree) {
        let extraValue = Math.random() * (minMax[1] - minMax[0]) + minMax[0];
        let extraPrice = price * (extraValue / 100);
        let newPrice = parseInt(price + extraPrice);
        if (Math.random() < probabilityToFree) {
            newPrice = 0;
        }
        return newPrice;
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
            if (gridItems[i].type === 'multi') {
                enabledPieces[12] = false
            }
            if (gridItems[i].type === 'reroll') {
                enabledPieces[6] = false
            }
        }
        const typesWithProbabilities = [
            { type: "colors", probability: 0.27, enabled: enabledPieces[0] },
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
            { type: "multi", probability: 0.03, enabled: enabledPieces[12] },
            { type: "ice", probability: 0.03, enabled: enabledPieces[13] },
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
            [spritesheets.bomb, Math.floor(Math.random() * 3) + 1, true, 0], // bomb
            [spritesheets.special, 7, 'hide', 0], // fire
            [spritesheets.special, 8, true, 0], // rainbow
            [spritesheets.special, 9, true, 0], // updown
            [spritesheets.special, 10, true, 0], // multi
            [spritesheets.special, 11, true, 0], // ice
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
        if (toolTipItem !== null) {
            toolTipItem[0].enabled = toolTipItem[1]; // Restore previous state
            toolTipItem = null; // Reset tooltip tracking
        }
        let desc = "";
        let gridItem = gridItems.find(item => item.element === element);
        let shopItem = shopItems.find(item => item.element === element)
        if (gridItem) {
            if (gridItem.enabled === 'empty') return
            desc = languageData.pieceDesc(language)[gridItem.desc];
            toolTipItem = [gridItem, gridItem.enabled]
            gridItem.enabled = 'hide';
        } else if (shopItem) {
            if (shopItem.enabled === 'empty') return
            desc = languageData.pieceDesc(language)[shopItem.desc];
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
        desc = wrapText(desc, 40);
        tooltip.innerText = desc;
        secondaryBackground.appendChild(tooltip);

        tooltip.style.position = "absolute";
        tooltip.style.left = "50%";
        tooltip.style.top = "18%";
        tooltip.style.transform = "translate(-50%, -50%)";
        // tooltip.style.whiteSpace = "pre-wrap";
        setTimeout(() => tooltip.classList.add("show"), 10);
        element.tooltipElement = tooltip;
    }

    function hideTooltip() {
        let tooltips = document.querySelectorAll(".tooltip");
        tooltips.forEach(tooltip => tooltip.remove());
    }


    function handleShopClick(shopItem, element) {
        setTimeout(() => {
            if (toolTipItem !== null) {
                toolTipItem[0].enabled = toolTipItem[1]
                toolTipItem = null
            }
        }, 1);
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

    //█========█// 
    // END DAY //
    //█========█//
    document.addEventListener("click", function (event) {
        const endDayButton = document.querySelector('.endDay-vocab');
        if (endDayButton.contains(event.target)) {
            gamePaused = true
            showPauseBackground(); // Ensure this function is defined
            playAudio('/SFX/System_Selected_Piece.ogg');
            let endayConfirmVocab = document.querySelector('.endayConfirmation-vocab');
            endayConfirmVocab.style.visibility = "visible"; // Make it visible

            const yesText = document.querySelector('.endayConfirmation-yes');
            yesText.style.visibility = "visible"; // Make it visible
            const yesConfirmText = document.createElement('div');
            yesConfirmText.classList.add('dayCount-text');
            yesConfirmText.textContent = languageData.vocab(language).yes; // Add your custom text here
            yesText.appendChild(yesConfirmText); // Append the text to the yesText element

            const noText = document.querySelector('.endayConfirmation-no');
            noText.style.visibility = "visible"; // Make it visible
            const noConfirmText = document.createElement('div');
            noConfirmText.classList.add('dayCount-text');
            noConfirmText.textContent = languageData.vocab(language).no; // Add your custom text here
            noText.appendChild(noConfirmText); // Append the text to the noText element

            // Create and append new text
            const endayConfirmText = document.createElement('div');
            endayConfirmText.classList.add('dayCount-text');
            endayConfirmText.textContent = languageData.vocab(language).finish;
            endayConfirmVocab.appendChild(endayConfirmText);
        }

        // Check if the "Yes" button was clicked
        const yesText = document.querySelector('.endayConfirmation-yes');
        if (yesText.contains(event.target)) {
            if (reRolls < 5) {
                reRolls += 3
                if (reRolls > 5) { reRolls = 5 }
                playAudio('/SFX/System_ReRoll.ogg');
                const ctx = reRollcanvas.getContext("2d");
                ctx.imageSmoothingEnabled = false;
                updateReRollImage(ctx, reRollcanvas);
                reRollButton.classList.add("shake");
                reRollButton.addEventListener("animationend", () => {
                    reRollButton.classList.remove("shake");
                });
            }
            playAudio('/SFX/System_Money.ogg');
            updateMoneyDisplay(-goalPoints);
            updateGoalPoints(goalPoints + 50)

            hideconfirmationMenu(); // Call hideconfirmationMenu() to hide the elements
        }

        // Check if the "No" button was clicked
        const noText = document.querySelector('.endayConfirmation-no');
        if (noText.contains(event.target)) {
            playAudio('/SFX/System_Cancel.ogg');
            hideconfirmationMenu(); // Call hideconfirmationMenu() to hide the elements
        }
    });

    // Function to hide the confirmation menu
    function hideconfirmationMenu() {
        // Hide the confirmation vocab
        gamePaused = false
        hidePauseBackground(); // Hide the pause background if needed
        const endayConfirmVocab = document.querySelector('.endayConfirmation-vocab');
        endayConfirmVocab.style.visibility = "hidden"; // Hide the confirmation

        // Hide the yesText and noText elements as well
        const yesText = document.querySelector('.endayConfirmation-yes');
        yesText.style.visibility = "hidden"; // Hide the yes option
        const noText = document.querySelector('.endayConfirmation-no');
        noText.style.visibility = "hidden"; // Hide the no option

        // Remove the dynamically created text elements from both yes and no
        const yesConfirmText = yesText.querySelector('.dayCount-text');
        if (yesConfirmText) {
            yesConfirmText.remove();
        }

        const noConfirmText = noText.querySelector('.dayCount-text');
        if (noConfirmText) {
            noConfirmText.remove();
        }

        // Also, remove the "Finish?" text if you want to hide everything
        const endayConfirmText = endayConfirmVocab.querySelector('.dayCount-text');
        if (endayConfirmText) {
            endayConfirmText.remove();
        }
    }

    //█========█// 
    // SHOP     //
    //█========█//
    function shopVocab() {
        let vocabElement = document.querySelector('.shop-vocab');
        vocabElement.innerText = languageData.vocab(language).shop;
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
                gridItems[randomIndex].canvas.style.opacity = "1"
                shopPiece.element.classList.add("shake");
                shopPiece.canvas.style.transition = "opacity 0.5s";
                shopPiece.canvas.style.opacity = "0";
                shopPiece.enabled = 'empty'
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

                shopPiece.canvas.style.transition = "none";
                shopPiece.canvas.style.opacity = "0";
                shopPiece.element.classList.remove("shake", "element-flash");

                let value;
                if (shopPiece.type === "numbers" && shopPiece.desc === "numbers2") {
                    value = 10
                } else {
                    value = shopPiece.value
                }
                generatePiece(randomIndex, gridContainer, "grid-item", shopPiece.type, false, value)

                playAudio('/SFX/System_Update_Shop.ogg');
                updateMoneyDisplay(-shopItems[buyButton.pieceIndex].price);
            }
        }
    });

    function handleGridClick(gridItem, element) {
        setTimeout(() => {
            if (toolTipItem !== null) {
                toolTipItem[0].enabled = toolTipItem[1]
                toolTipItem = null
            }
        }, 1);
        let numbersSize = 0;
        for (let i = 0; i < gridItems.length; i++) {
            if (gridItems[i].type === 'numbers' && gridItems[i].enabled !== 'empty') {
                numbersSize += 1
            }
        }
        if (gridItem.enabled === false) {
            disabledPiece(gridItem)
            return
        } else if (gridItem.enabled === 'hide' || gridItem.enabled === 'empty') {
            return
        } else if (gridItem.type === 'updown') {
            if (numbersSize >= 1) {
                updown(gridItem);
            } else {
                disabledPiece(gridItem)
            }
            return
        } else if (gridItem.type === 'reroll') {
            if (reRolls < 5) {
                updateRoll(gridItem)
            } else {
                disabledPiece(gridItem)
            }
            return
        } else if (gridItem.type === 'ice') {
            updateFreeze(gridItem)
            return
        } else if (gridItem.type === 'rainbow') {
            if (numbersSize >= 1) {
                updateRainbow(gridItem)
            } else {
                disabledPiece(gridItem)
            }
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
            } else if (gridItem.type === 'multi') {
            } else if (gridItem.type === 'zul') {

            } else if (gridItem.type === 'colors') {
                if (selectedPieces.length > 0) {
                    let colors = []
                    for (let i = 0; i < selectedPieces.length; i++) {
                        if (selectedPieces[i].enabled === 'empty' || selectedPieces[i].type === null) continue
                        if (selectedPieces[i].type === 'multi') continue
                        colors.push(selectedPieces[i].value)
                    }
                    const hasDifferentColor = colors.some(c => c !== gridItem.value)
                    if (hasDifferentColor) {
                        selectedPieceValue = 11
                    } else if (colors.length > 0) {
                        selectedPieceValue = 10
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
            item.type = null
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
        let multi = selectedPieces.some(n => n.type === "multi");
        let pieceMulti = 1;
        if (multi) {
            pieceMulti = 2;
        }

        if (mode === 'success') {
            updateMoneyDisplay((totalPoints * selectedPieces.length) * pieceMulti);
            updateSpecialPieces();
        }

        if (pieceBurned > 0) {
            playAudio('/SFX/System_Fire.ogg');
        }

        pieceBurned = 0;
        selectedPieceValue = 0;
        selectedPieces = [];
    }

    function updateSpecialPieces() {
        for (let i = 0; i < gridItems.length; i++) {
            if (gridItems[i].type === 'fire' && gridItems[i].enabled !== 'empty') {
                updateFire(gridItems[i]);
            }
        }

        for (let i = 0; i < gridItems.length; i++) {
            if (gridItems[i].type === 'bomb' && gridItems[i].value === 3 && gridItems[i].enabled !== 'empty') {
                if (gridItems[i].isBurned) continue
                updatebomb(i);
            }
        }
        for (let i = 0; i < gridItems.length; i++) {
            if (gridItems[i].type === 'roman' && gridItems[i].enabled !== 'empty') {
                if (gridItems[i].isBurned) continue
                updateRoman(i);
            }
        }
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
        playFlashAnimation(item.element, 'rgba(250, 233, 0, 0.8)', 'rgba(255, 238, 0, 0.5)')
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

    function updateFreeze(piece){
        piece.enabled = 'empty';
        piece.canvas.style.transition = "opacity 0.5s";
        piece.canvas.style.opacity = "0";
        playFlashAnimation(piece.element, 'rgba(72, 249, 255, 0.8)', 'rgba(129, 236, 255, 0.5)')
        playAudio('/SFX/System_Freeze.ogg');
        freezeTimer(15)
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
                animColor = ['rgba(255, 172, 172, 0.8)', 'rgba(184, 78, 78, 0.5)']
            } else {
                animColor = ['rgba(179, 255, 172, 0.8)', 'rgba(96, 184, 78, 0.5)']
            }
            gridItems[index].enabled = 'empty';
            gridItems[index].canvas.style.transition = "opacity 0.5s";
            gridItems[index].canvas.style.opacity = "0";
            playFlashAnimation(gridItems[index].element, animColor[0], animColor[1])
            let rainbowSelected = selectedPieces.indexOf(gridItems[index])
            if (rainbowSelected != -1) {
                selectedPieces[rainbowSelected].element.classList.remove("selected");
                selectedPieceValue -= gridItems[index].value;
                selectedPieces = selectedPieces.filter(item => item !== gridItems[index]);
            }
            setTimeout(() => {
                generatePiece(index, shopContainer, "grid-item", "updown_numbers");
                gridItems[index].canvas.style.transition = "opacity 0.5s";
                gridItems[index].canvas.style.opacity = "1";
            }, 500);
            let breakChance = Math.random() < 0.25;
            if (updatedPieces > 0 && breakChance) break;
            updatedPieces += 1;
        }
    }

    function bombExplode(item, sound = true) {
        if (sound) {
            playAudio('/SFX/System_Explosion.ogg');
        }
        item.enabled = 'empty';
        item.canvas.style.transition = "opacity 0.5s";
        item.canvas.style.opacity = "0";
        playFlashAnimation(item.element, 'rgba(250, 150, 0, 0.8)', 'rgba(255, 102, 0, 0.5)');
        let centerIndex = gridItems.indexOf(item);
        let centerX = centerIndex % gridSize;
        let centerY = Math.floor(centerIndex / gridSize);
        if (item.value === 1 || item.value === 3) {
            // 3x3 explosion (square)
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    let newX = centerX + dx;
                    let newY = centerY + dy;
                    if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
                        explodePiece(gridItems[newY * gridSize + newX]);
                    }
                }
            }
        } else if (item.value === 2) {
            // Cross explosion ("+" shape)
            let directions = [
                { dx: -1, dy: 0 },  // Left
                { dx: 1, dy: 0 },   // Right
                { dx: 0, dy: -1 },  // Up
                { dx: 0, dy: 1 }    // Down
            ];
            for (let { dx, dy } of directions) {
                let newX = centerX;
                let newY = centerY;
                while (true) {
                    newX += dx;
                    newY += dy;
                    if (newX < 0 || newX >= gridSize || newY < 0 || newY >= gridSize) break; // Stop at border
                    let piece = gridItems[newY * gridSize + newX];
                    if (piece.enabled === 'empty') continue; // ignore empty space
                    explodePiece(piece);
                }
            }
        }
    }

    function explodePiece(piece) {
        if (piece.enabled !== 'empty') {
            if (piece.type === 'bomb') {
                setTimeout(() => bombExplode(piece, false), 10);
            }
            let destroySelected = selectedPieces.indexOf(piece);
            if (destroySelected !== -1) {
                selectedPieces[destroySelected].element.classList.remove("selected");
                selectedPieceValue -= piece.value;
                selectedPieces = selectedPieces.filter(item => item !== piece);
            }
            piece.enabled = 'empty';
            piece.canvas.style.transition = "opacity 0.5s";
            piece.canvas.style.opacity = "0";
            playFlashAnimation(piece.element, 'rgba(250, 150, 0, 0.8)', 'rgba(255, 102, 0, 0.5)');
        }
    }

    let pieceBurned = 0
    function updateFire(item) {
        function getRandomChoice() {
            return Math.random() < 0.3 ? true : false;
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

    function updatebomb(index) {
        function getRandomChoice() {
            return Math.random() < 0.1 ? true : false;
        }
        let detonateChance = getRandomChoice();
        if (!detonateChance) return;
        let item = gridItems[index];
        if (item.type === 'bomb' && item.value === 3 && !item.isBurned && item.enabled !== 'empty') {
            bombExplode(item)
        }
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

}



