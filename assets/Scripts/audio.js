export function loadAudio(scene) {

    // SFX //
    scene.load.audio('clickSound', 'assets/Audio/SFX/System_Selected_Piece.ogg');
    scene.load.audio('selectedOk', 'assets/Audio/SFX/System_Selected_Ok.ogg');
    scene.load.audio('selectedCancel', 'assets/Audio/SFX/System_Selected_Cancel.ogg')
    scene.load.audio('selectedError', 'assets/Audio/SFX/System_Selected_Error.ogg');
    scene.load.audio('pieceDisabled', 'assets/Audio/SFX/System_Piece_Disabled.ogg');
    scene.load.audio('shuffle', 'assets/Audio/SFX/System_Shuffle.ogg');
    scene.load.audio('money', 'assets/Audio/SFX/System_Money.ogg');
    scene.load.audio('gift', 'assets/Audio/SFX/System_Gift.ogg');
    scene.load.audio('romanUpdate', 'assets/Audio/SFX/System_Roman_Update.ogg');
    scene.load.audio('bubble', 'assets/Audio/SFX/System_Bubble_Pop.ogg');
    

    // BGM //
    scene.load.audio('bgm001', 'assets/Audio/BGM/bgm001.ogg');
}
