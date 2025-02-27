export function clearGrid(pieces,cols,rows) {
    pieces.forEach(piece => {
      if (piece !== null) {
        piece.destroy()
      }  
    }
    )
    pieces = new Array(cols*rows).fill(null);
}

export function createBackground(scene) {
  let back = scene.add.graphics();
  back.fillStyle(0xa1a9af, 1); 
  back.fillRect(0, 0, scene.scale.width, scene.scale.height);
  let borderHeight = 75;
  // 🔹 Top Border (Starts Offscreen)
  let topBorder = scene.add.graphics();
  topBorder.fillStyle(0x8a8c8e, 1); 
  topBorder.fillRect(0, 0, scene.scale.width, borderHeight);
  let topBorder2 = scene.add.graphics();
  topBorder2.fillStyle(0x000000, 1); 
  topBorder2.fillRect(0, 0, scene.scale.width, 1);
  topBorder.y = -borderHeight; // Start above the screen
  // 🔹 Bottom Border (Starts Offscreen)
  let bottomBorder = scene.add.graphics();
  bottomBorder.fillStyle(0x8a8c8e, 1);
  bottomBorder.fillRect(0, 0, scene.scale.width, borderHeight);
  let bottomBorder2 = scene.add.graphics();
  bottomBorder2.fillStyle(0x000000, 1); 
  bottomBorder2.fillRect(0, 0, scene.scale.width, 1);
  // Start bottom borders offscreen
  bottomBorder.y = scene.scale.height + borderHeight; // Start below the screen
  bottomBorder2.y = scene.scale.height + borderHeight + 1; // Slightly below the bottomBorder
  // 🔹 Tween Animation for All Borders
  const borders = [
    { target: topBorder, y: 0 },
    { target: topBorder2, y: borderHeight },
    { target: bottomBorder, y: scene.scale.height - borderHeight },
    { target: bottomBorder2, y: scene.scale.height - (borderHeight + 1) }
  ];
  // Loop through all borders and animate them
  borders.forEach(border => {
    scene.tweens.add({
      targets: border.target,
      y: border.y, // Final position
      duration: 500,
      ease: 'linear'
    });
  });
}


export function createText(scene,color) {
  let text = scene.add.text(
    100, // x position
    100, // y position
    'Hello Phaser!', // Text content
    {
      font: '32px Arial', // Font size and family
      fill: '#ffffff',    // Text color (white)
      stroke: '#000000',  // Stroke (border) color (black)
      strokeThickness: 2, // Stroke (border) thickness
      align: 'center',    // Text alignment (center, left, right)
      resolution: 10, // Higher resolution to avoid blur
      wordWrap: { width: 400, useAdvancedWrap: true } // Optional: wrapping the text if too long
    }
  );

  // You can also change the font dynamically later:
  text.setFontSize(30); // Change font size
  text.setFontFamily('UA Serifed'); // Change font family
 // text.setColor(`${color}`); // Change font color to red
}


export function createBoard(scene,baseBoardPos,cols,rows) {
    let boardBorder1 = scene.add.graphics();
    boardBorder1.fillStyle(0xb9a3e3, 1); 
    boardBorder1.fillRect(baseBoardPos[0], baseBoardPos[1], cols*36, rows*36);  
    let boardBorder2 = scene.add.graphics();
    boardBorder2.fillStyle(0x262626, 1); 
    boardBorder2.fillRect(baseBoardPos[0], baseBoardPos[1]+rows*36, cols*36, 50);  
    let boardBorder3 = scene.add.graphics();
    for (let i = 0; i < 7; i++) {
    boardBorder3.fillStyle(0x000000, 1); 
    boardBorder3.fillRect((baseBoardPos[0]+70)+(i*30), (baseBoardPos[1]+4)+rows*36, 27, 42);  
    boardBorder3.fillStyle(0x808080, 1); 
    boardBorder3.fillRect((baseBoardPos[0]+70+1)+(i*30), (baseBoardPos[1]+4+1)+rows*36, 25, 40);  
    }   
}
