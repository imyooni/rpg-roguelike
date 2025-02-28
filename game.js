
import { loadAudio } from './assets/Scripts/audio.js';
import { loadSprites } from './assets/Scripts/sprites.js';
import { loadAnimations } from './assets/Scripts/animations.js';

import * as main from './main_functions.js';
import * as sprites_fn from './sprites_functions.js';


var config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

var game = new Phaser.Game(config);

window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});

// Create the game instance


///////////
// board //
///////////
let baseBoardPos = [100,250]
let pieceSize = 48
let cols = 5;
let rows = 10;
let pieces = new Array(cols*rows).fill(null);
let borderSprites = [];
let blankSprites = [];
let spacing = pieceSize + 3
let selectedPieces = [];
let selectedValue = 0;
let uniqueIDCounter = 0; 
///////////
// money //
///////////
let money = 0;
let digitSprites = []; 


function preload() {
    loadSprites(this);  
    loadAudio(this);    
}
function update() {}

function create() {
    createSprites(this)
    sprites_fn.PiecesBg(this,rows,cols,baseBoardPos,spacing,pieceSize)
    loadAnimations(this);
    main.createText(this,0xffffff)

        // Set initial zoom level
    camera.setZoom(1);

    // Listen for wheel event
    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ, event) => {
        if (event.ctrlKey) {  // Check if Ctrl is pressed
            let zoom = camera.zoom - deltaY * 0.001;
            camera.setZoom(Phaser.Math.Clamp(zoom, 0.5, 3)); // Clamp zoom between 0.5x and 3x
        }
    });
}

window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});


function createSprites(scene) {
    main.createBackground(scene);
}


function GeneratePiece(scene,index) {
    // Calculate x and y grid positions from the given index
    let y = Math.floor(index / cols);  // Calculate row
    let x = index % cols;  // Calculate column

    let num;
    let spriteIndex;
    let type;
    let spriteChoice = Phaser.Math.Between(1, 100);
    let spriteKey;

    // Determine the type of sprite and set properties
    if (spriteChoice <= 75) {
        type = "number";
        num = Phaser.Math.Between(1, 9);
        spriteIndex = num - 1;
        spriteKey = 'numbers';  
    } else {
        spriteKey = 'special'; 
        num = Phaser.Math.Between(1, 9);
        spriteIndex = num - 1;
        let typesList = [
            "blocked","banana","gift","roman","secret","zul",
            "notes","bubble","shuffle"];
        type = typesList[num - 1];
        if (type === "roman") {
            spriteKey = 'roman';     
            num = Phaser.Math.Between(1, 9); 
            spriteIndex = num - 1;
        } else if (type === "zul") {
            spriteKey = 'zul';     
            num = Phaser.Math.Between(1, 3); 
            spriteIndex = num - 1; 
        } else if (type === "notes") {
            spriteKey = 'notes';     
            num = Phaser.Math.Between(1, 4); 
            spriteIndex = num - 1;     
        }
    }

    // Calculate position on the grid based on x and y
    let posX = (baseBoardPos[0] + 22) + x * spacing;
    let posY = (baseBoardPos[1] + 20) + y * spacing;

    // Create the sprite for this piece
    let number = scene.add.sprite(posX, posY, spriteKey, spriteIndex);
    number.setDepth(5);
    number.setAlpha(0);  // Make it invisible initially

    // Set piece data
    number.setData('uniqueID', uniqueIDCounter++);
    number.setData('type', type);
    number.setData('value', num);

    let mode 
    if (type === "bubble") {
    mode = "pause"
    }
    else {mode = true}   

    number.setData('enabled', mode);
    number.setInteractive();

    // Add the piece to the pieces array at the specified index
    pieces[index] = number;

    // Animate the sprite to fade in
    scene.tweens.add({
        targets: number,
        alpha: 1,  // Fade to fully visible
        duration: 200,  // Duration of the fade-in animation
        ease: 'Linear'
    });
}

