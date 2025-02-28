export function PiecesBg(scene,rows,cols,baseBoardPos,spacing,size) {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            let posX = (baseBoardPos[0]+22)+ x * spacing;
            let posY = (baseBoardPos[1]+20) + y * spacing;
            let pieceBack1 = scene.add.graphics();
            pieceBack1.fillStyle(0x000000, 1); 
            pieceBack1.fillRect(posX - 16, posY - 16, size, size); 
            pieceBack1.setDepth(0);
            let pieceBack2 = scene.add.graphics();
            pieceBack2.fillStyle(0xE6E6FA, 1); 
            pieceBack2.fillRect(posX - 15, posY - 15, size-2, size-2); 
            pieceBack2.setDepth(0);
        }
    }
}

export function animateMoneyIncrease(targetAmount,scene,digitSprites,speed = 50) {
    let currentAmount = parseInt(digitSprites.map(sprite => sprite.frame.name).join('')) || 0;
    if (currentAmount < targetAmount) {
        let moneyTimer = scene.time.addEvent({
            delay: speed, 
            callback: () => {
                currentAmount++;
                updateMoneyDisplay(currentAmount, digitSprites);
                if (currentAmount >= targetAmount) {
                    moneyTimer.remove();
                }
            },
            loop: true
        });
    }
}

function updateMoneyDisplay(amount, digitSprites) {
    let amountStr = amount.toString().padStart(7, '0');
    for (let i = 0; i < amountStr.length; i++) {
       let digit = parseInt(amountStr[i]); 
       digitSprites[i].setFrame(digit); 
   }
}

export function destroyNearbyBubble(scene,centerIndex,pieces,cols,rows,blankSprites) {
    let centerX = centerIndex % cols;
    let centerY = Math.floor(centerIndex / cols);
    let bubblesDestroyed = 0
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            let newX = centerX + dx;
            let newY = centerY + dy;
            let newIndex = newY * cols + newX;
            if (newX >= 0 && newX < cols && newY >= 0 && newY < rows) {
                let piece = pieces[newIndex];
                if (piece && piece.getData('type') === "bubble") {
                    drawBlank(piece,scene,0x7FFFD4,blankSprites)
                    piece.destroy();
                    pieces[newIndex] = null;
                    bubblesDestroyed++;
                }
            }
        }
    }
  return bubblesDestroyed
}

function drawBlank(piece,scene,color,blankSprites) {
    let blank = scene.add.sprite(piece.x, piece.y, 'piece_blank');
    blank.setDepth(piece.depth+2); 
    blank.setTint(color);
    blank.setPosition(piece.x, piece.y); 
    blankSprites.push(blank); 
}
