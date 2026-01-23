/**
 * main.js - Entry point for Sky Hopper (Phaser 3 Version)
 */

import BootScene from './scenes/BootScene.js';
import PlayScene from './scenes/PlayScene.js';

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 711,
    parent: 'game-container',
    backgroundColor: '#87CEEB',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },  // No world gravity, objects set their own
            debug: false
        }
    },
    scene: [BootScene, PlayScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    input: {
        activePointers: 2
    }
};

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Create Phaser game instance
    const game = new Phaser.Game(config);

    // Store references for UI interaction
    window.game = game;

    console.log('Sky Hopper (Phaser 3) loaded!');
});
