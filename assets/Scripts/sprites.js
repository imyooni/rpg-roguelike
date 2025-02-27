export function loadSprites(scene) {
    // spritesheets //
    scene.load.spritesheet('numbers', 'assets/Sprites/numbers.png', { frameWidth: 32, frameHeight: 32 });
    scene.load.spritesheet('special', 'assets/Sprites/special.png', { frameWidth: 32, frameHeight: 32 });
    scene.load.spritesheet('roman', 'assets/Sprites/roman.png', { frameWidth: 32, frameHeight: 32 });
    scene.load.spritesheet('zul', 'assets/Sprites/zul.png', { frameWidth: 32, frameHeight: 32 });
    scene.load.spritesheet('notes', 'assets/Sprites/music_notes.png', { frameWidth: 32, frameHeight: 32 });
    scene.load.spritesheet('shuffle', 'assets/Sprites/shuffle_button.png', { frameWidth: 34, frameHeight: 64 });
    scene.load.spritesheet('borderSprite', 'assets/Sprites/border.png', { frameWidth: 32, frameHeight: 32 });
    scene.load.spritesheet('romanAni', 'assets/Sprites/romanAni.png', { frameWidth: 32, frameHeight: 32 });
    scene.load.spritesheet('moneySprite', 'assets/Sprites/money_numbers.png', { frameWidth: 22, frameHeight: 38 });
    
    scene.load.image('piece_blank', 'assets/Sprites/piece_blank.png');
}
