export function loadAnimations(scene) {
    scene.anims.create({
        key: 'spin',  // The name of the animation
        frames: [
            { key: 'shuffle', frame: 1 },  // Frame 1 first
            { key: 'shuffle', frame: 2 },  // Frame 2 second
            { key: 'shuffle', frame: 3 },  // Frame 3 third
            { key: 'shuffle', frame: 0 }   // Frame 0 last
        ],
        frameRate: 10,  // Frames per second
        repeat: 0  // Repeat indefinitely
    });

    scene.anims.create({
        key: 'borderAni',  // The name of the animation
        frames: scene.anims.generateFrameNumbers('borderSprite', { start: 0, end: 4 }), 
        frameRate: 10,  // Frames per second
        repeat: -1  // Repeat indefinitely
    });
    scene.anims.create({
        key: 'romanAni',  // The name of the animation
        frames: scene.anims.generateFrameNumbers('romanAni', { start: 0, end: 4 }), 
        frameRate: 10,  // Frames per second
        repeat: 0 
    });
}