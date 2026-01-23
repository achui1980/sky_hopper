/**
 * BootScene.js - Preload scene for generating textures
 */

import { generateTextures } from '../TextureGenerator.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Nothing to preload from files - we generate all textures programmatically
    }

    create() {
        // Generate all game textures
        generateTextures(this);

        // Start the play scene
        this.scene.start('PlayScene');
    }
}
