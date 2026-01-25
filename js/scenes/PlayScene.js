/**
 * PlayScene.js - Main game scene
 */

import Plane from '../sprites/Plane.js';
import CloudManager from '../managers/CloudManager.js';
import AudioSynth from '../managers/AudioSynth.js';

// Game states
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    GAME_OVER: 'gameOver'
};

// Biome thresholds
export const Biome = {
    SKY: 'sky',
    STRATOSPHERE: 'stratosphere',
    SPACE: 'space'
};

export const BIOME_THRESHOLDS = {
    STRATOSPHERE: 2000,
    SPACE: 5000
};

export default class PlayScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PlayScene' });
    }

    create() {
        // Game state
        this.gameState = GameState.MENU;
        this.isPaused = false;
        this.score = 0;
        this.maxHeight = 0;
        this.currentBiome = Biome.SKY;
        
        // Load high score
        this.highScore = parseInt(localStorage.getItem('sky_hopper_high_score') || '0');

        // Reference to DOM elements
        this.scoreElement = document.getElementById('score');
        this.startScreen = document.getElementById('start-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.pauseScreen = document.getElementById('pause-screen');
        this.finalScoreElement = document.getElementById('final-score');
        this.startHighScoreElement = document.getElementById('start-high-score');
        this.gameOverHighScoreElement = document.getElementById('game-over-high-score');
        
        // Update high score display
        this.updateHighScoreDisplay();

        // Screen dimensions
        this.gameWidth = this.scale.width;
        this.gameHeight = this.scale.height;

        // Initialize background
        this.createBackground();

        // Create player
        this.plane = new Plane(this, this.gameWidth / 2, this.gameHeight - 150);
        this.add.existing(this.plane);
        this.plane.initPhysics();

        // Create cloud manager
        this.cloudManager = new CloudManager(this);

        // Create audio synthesizer for 8-bit sound effects
        this.audio = new AudioSynth(this);

        console.log('Cloud manager created, clouds group:', this.cloudManager.clouds.getChildren().length);

        // Setup input
        this.setupInput();

        // Setup collisions
        this.setupCollisions();

        // Setup UI button listeners
        this.setupUIListeners();

        // Show menu initially
        this.showMenu();

        console.log('PlayScene initialized');
    }

    createBackground() {
        // Background will be dynamically updated based on biome
        this.cameras.main.setBackgroundColor('#87CEEB');

        // Create stars for space biome (initially hidden)
        this.stars = this.add.group();
        for (let i = 0; i < 100; i++) {
            const star = this.add.circle(
                Phaser.Math.Between(0, this.gameWidth),
                Phaser.Math.Between(0, this.gameHeight),
                Phaser.Math.Between(1, 2),
                0xffffff
            );
            star.setAlpha(0);
            star.setData('twinkle', Math.random() * Math.PI * 2);
            star.setData('twinkleSpeed', 0.02 + Math.random() * 0.05);
            this.stars.add(star);
        }
    }

    setupInput() {
        // Keyboard controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Touch controls
        this.input.on('pointerdown', (pointer) => {
            if (this.gameState !== GameState.PLAYING) return;

            const midX = this.gameWidth / 2;
            if (pointer.x < midX) {
                this.touchLeft = true;
            } else {
                this.touchRight = true;
            }
        });

        this.input.on('pointerup', () => {
            this.touchLeft = false;
            this.touchRight = false;
        });
        
        // Multi-touch for gliding (two pointers down)
        this.input.addPointer(1); // Ensure we have at least 2 pointers enabled
    }

    setupCollisions() {
        // Collision between plane and clouds (handled manually for one-way platform)
        // See update() method
    }

    setupUIListeners() {
        const startBtn = document.getElementById('start-btn');
        const restartBtn = document.getElementById('restart-btn');

        // Remove old listeners if any
        const newStartBtn = startBtn.cloneNode(true);
        const newRestartBtn = restartBtn.cloneNode(true);
        startBtn.parentNode.replaceChild(newStartBtn, startBtn);
        restartBtn.parentNode.replaceChild(newRestartBtn, restartBtn);

        newStartBtn.addEventListener('click', () => {
            this.startGame();
        });

        newRestartBtn.addEventListener('click', () => {
            this.startGame();
        });

        // Spacebar to start (pause logic moved to avoid conflict with gliding)
        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.gameState === GameState.MENU || this.gameState === GameState.GAME_OVER) {
                this.startGame();
            } else if (this.gameState === GameState.PLAYING) {
                // Space is now used for gliding, so we use 'P' or Escape for pause
                // Or we can check if it's a short press vs hold, but for now let's use P for pause
            }
        });
        
        // P key for pause
        this.input.keyboard.on('keydown-P', () => {
             if (this.gameState === GameState.PLAYING) {
                this.togglePause();
            }
        });

        // Enter to start
        this.input.keyboard.on('keydown-ENTER', () => {
            if (this.gameState === GameState.MENU || this.gameState === GameState.GAME_OVER) {
                this.startGame();
            }
        });
    }

    showMenu() {
        this.gameState = GameState.MENU;
        this.startScreen.classList.remove('hidden');
        this.gameOverScreen.classList.add('hidden');
    }

    startGame() {
        this.gameState = GameState.PLAYING;
        this.isPaused = false;
        this.score = 0;
        this.maxHeight = 0;
        this.currentBiome = Biome.SKY;

        // Hide UI screens
        this.startScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.pauseScreen.classList.add('hidden');

        // Reset plane
        this.plane.reset(this.gameWidth / 2, this.gameHeight - 150);

        // Reset clouds
        this.cloudManager.reset();
        
        console.log('Game started, clouds count:', this.cloudManager.clouds.getChildren().length);

        // Update score display
        this.scoreElement.textContent = '0';

        console.log('Game started');
    }

    update(time, delta) {
        if (this.gameState !== GameState.PLAYING || this.isPaused) return;

        // Update biome
        this.updateBiome();

        // Update background
        this.updateBackground();

        // Get input
        // Check for multi-touch (two pointers down)
        const activePointers = this.input.pointer1.isDown + this.input.pointer2.isDown;
        const isMultiTouch = activePointers >= 2;

        const input = {
            left: this.cursors.left.isDown || this.keyA.isDown || this.touchLeft,
            right: this.cursors.right.isDown || this.keyD.isDown || this.touchRight,
            up: this.cursors.up.isDown || this.keyW.isDown || this.keySpace.isDown || isMultiTouch
        };

        // Update plane
        this.plane.update(input, delta);

        // Camera scroll logic (pseudo-infinite scroll)
        const middleY = this.gameHeight / 2;
        if (this.plane.y < middleY && this.plane.body.velocity.y < 0) {
            const scrollAmount = middleY - this.plane.y;

            // Lock plane to middle (use setY to sync with physics body)
            this.plane.setY(middleY);

            // Scroll world down
            this.cloudManager.scrollDown(scrollAmount);

            // Update score
            this.maxHeight += scrollAmount;
            this.score = Math.floor(this.maxHeight);
            this.scoreElement.textContent = this.score;
        }

        // Update cloud manager
        this.cloudManager.update();

        // Check collision with clouds (manual one-way platform logic)
        if (!this.plane.isRocketBoosting && this.gameState === GameState.PLAYING) {
            const hitCloud = this.cloudManager.checkCollision(this.plane);
            if (hitCloud && this.gameState === GameState.PLAYING) {
                this.plane.bounce();
                hitCloud.onBounce();
            }
        }

        // Check collision with collectibles
        const hitCollectible = this.cloudManager.checkCollectibleCollision(this.plane);
        if (hitCollectible) {
            this.handleCollectible(hitCollectible);
        }

        // Check if plane fell off screen
        if (this.plane.y > this.gameHeight + this.plane.height) {
            this.gameOver();
        }
    }

    updateBiome() {
        if (this.score >= BIOME_THRESHOLDS.SPACE) {
            this.currentBiome = Biome.SPACE;
        } else if (this.score >= BIOME_THRESHOLDS.STRATOSPHERE) {
            this.currentBiome = Biome.STRATOSPHERE;
        } else {
            this.currentBiome = Biome.SKY;
        }

        // Update gravity multiplier based on biome
        this.plane.setGravityMultiplier(this.getGravityMultiplier());
    }

    getGravityMultiplier() {
        if (this.currentBiome === Biome.SPACE) {
            return 0.6;
        }
        return 1.0;
    }

    updateBackground() {
        // Update background color based on biome
        if (this.currentBiome === Biome.SKY) {
            this.cameras.main.setBackgroundColor('#87CEEB');
            this.stars.children.entries.forEach(star => star.setAlpha(0));
        } else if (this.currentBiome === Biome.STRATOSPHERE) {
            const progress = Math.min(
                (this.score - BIOME_THRESHOLDS.STRATOSPHERE) / 
                (BIOME_THRESHOLDS.SPACE - BIOME_THRESHOLDS.STRATOSPHERE),
                1
            );
            const r = Math.floor(75 - progress * 50);
            const g = 0;
            const b = Math.floor(130 - progress * 80);
            this.cameras.main.setBackgroundColor(Phaser.Display.Color.GetColor(r, g, b));

            // Show some stars
            this.stars.children.entries.forEach(star => {
                star.setAlpha(progress * 0.5);
            });
        } else {
            this.cameras.main.setBackgroundColor('#000011');
            
            // Full stars with twinkling
            this.stars.children.entries.forEach(star => {
                const twinkle = star.getData('twinkle') + star.getData('twinkleSpeed');
                star.setData('twinkle', twinkle);
                const brightness = 0.5 + Math.sin(twinkle) * 0.5;
                star.setAlpha(brightness);
            });
        }
    }

    handleCollectible(collectible) {
        if (collectible.type === 'rocket') {
            this.plane.activateRocketBoost();
            this.cameras.main.shake(150, 0.005);
            // Rocket sound is played in Plane.activateRocketBoost()
        } else if (collectible.type === 'coin') {
            this.score += 100;
            this.scoreElement.textContent = this.score;
            // Play coin collect sound
            this.audio.playCoin();
        }
        collectible.collect();
    }

    gameOver() {
        this.gameState = GameState.GAME_OVER;
        
        // Check and update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('sky_hopper_high_score', this.highScore);
            this.updateHighScoreDisplay();
        }

        // Play game over sound
        this.audio.playGameOver();
        
        // Show game over screen
        this.gameOverScreen.classList.remove('hidden');
        this.finalScoreElement.textContent = `Score: ${this.score}`;

        console.log('Game over - Score:', this.score);
    }

    updateHighScoreDisplay() {
        if (this.startHighScoreElement) {
            this.startHighScoreElement.textContent = `High Score: ${this.highScore}`;
        }
        if (this.gameOverHighScoreElement) {
            this.gameOverHighScoreElement.textContent = `High Score: ${this.highScore}`;
        }
    }

    getCurrentBiome() {
        return this.currentBiome;
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            // Pause game
            this.plane.body.setVelocity(0, 0);
            this.plane.body.moves = false;  // Freeze physics
            
            // Stop particle effects
            if (this.plane.trailEmitter) {
                this.plane.trailEmitter.stop();
            }
            
            // Show pause screen
            this.pauseScreen.classList.remove('hidden');
        } else {
            // Resume game
            this.plane.body.moves = true;
            
            // Restore particle effects (if rocket boosting)
            if (this.plane.isRocketBoosting && this.plane.trailEmitter) {
                this.plane.trailEmitter.start();
            }
            
            // Hide pause screen
            this.pauseScreen.classList.add('hidden');
        }
    }
}
