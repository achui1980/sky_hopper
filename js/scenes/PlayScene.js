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
        this.width = this.game.config.width;
        this.height = this.game.config.height;
        this.gameState = GameState.WAITING_TO_START; // Fix: Initialize game state

        // Background
        this.bg = this.add.tileSprite(0, 0, this.width, this.height, 'bg-sky');
        this.bg.setOrigin(0, 0);
        this.isPaused = false;
        this.score = 0;
        this.maxHeight = 0;
        this.currentBiome = Biome.SKY;
        this.dragonBallCount = 0;
        this.hasShield = false;
        this.shieldSprite = null;
        this.scoreMultiplier = 1.0;
        
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
        this.dbSlots = document.querySelectorAll('.db-slot');
        this.shieldIndicator = document.getElementById('shield-indicator');
        
        // Fate UI
        this.fateScreen = document.getElementById('fate-screen');
        this.fateCard = document.getElementById('fate-card');
        this.fateCardFront = this.fateCard.querySelector('.card-front');
        this.fateIcon = document.getElementById('fate-icon');
        this.fateTitle = document.getElementById('fate-title');
        this.fateDesc = document.getElementById('fate-desc');
        this.fateInstruction = document.getElementById('fate-instruction');
        
        // Fate Status UI
        this.fateStatusContainer = document.getElementById('fate-status-container');
        
        // Remove setupFateUI call as interaction is removed

        // Reset UI
        this.updateDragonBallUI();
        this.shieldIndicator.classList.add('hidden');
        
        // Reset fate UI
        this.fateScreen.classList.add('hidden');
        this.fateCard.classList.remove('flipped');
        this.fateInstruction.classList.add('hidden'); // Hide instruction
        this.fateStatusContainer.classList.add('hidden'); // Hide status initially
        this.activeBuffs = []; // Store active buffs (max 3)
        
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

    setupFateUI() {
        this.fateCard.addEventListener('click', () => {
            if (!this.fateCard.classList.contains('flipped') && this.gameState === 'fate') {
                this.revealFate();
            }
        });
        
        this.fateContinueBtn.addEventListener('click', () => {
            this.resumeFromFate();
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
        this.scoreMultiplier = 1.0;
        this.dragonBallCount = 0;
        this.hasShield = false;
        if (this.shieldSprite) {
            this.shieldSprite.destroy();
            this.shieldSprite = null;
        }
        this.updateDragonBallUI();
        this.shieldIndicator.classList.add('hidden');
        
        // Reset fate UI
        this.fateScreen.classList.add('hidden');
        this.fateCard.classList.remove('flipped');
        this.fateInstruction.classList.add('hidden');
        this.fateStatusContainer.classList.add('hidden');
        this.activeBuffs = [];
        this.updateFateStatusUI(); // Clear UI

        // Hide UI screens
        this.startScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.pauseScreen.classList.add('hidden');

        // Reset plane
        this.plane.reset(this.gameWidth / 2, this.gameHeight - 130);

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
        
        // Update shield sprite
        if (this.hasShield && this.shieldSprite) {
            this.shieldSprite.setPosition(this.plane.x, this.plane.y);
            this.shieldSprite.rotation += 0.05;
        }

        // Camera scroll logic (pseudo-infinite scroll)
        const middleY = this.gameHeight / 2;
        if (this.plane.y < middleY && this.plane.body.velocity.y < 0) {
            const scrollAmount = middleY - this.plane.y;

            // Lock plane to middle (use setY to sync with physics body)
            this.plane.setY(middleY);

            // Scroll world down
            this.cloudManager.scrollDown(scrollAmount);
            
            // Scroll background (parallax)
            if (this.bg) {
                this.bg.tilePositionY -= scrollAmount * 0.5;
            }

            // Update score
            this.maxHeight += scrollAmount * this.scoreMultiplier;
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
            this.score += 100 * this.scoreMultiplier;
            this.scoreElement.textContent = this.score;
            // Play coin collect sound
            this.audio.playCoin();
        } else if (collectible.type === 'dragonball') {
            this.collectDragonBall();
        } else if (collectible.type === 'fate-card') {
            this.triggerFateCard();
        }
        collectible.collect();
    }
    
    collectDragonBall() {
        if (this.dragonBallCount < 7) {
            this.dragonBallCount++;
            this.updateDragonBallUI();
            
            // Play sound
            if (this.audio.playDragonBallCollect) {
                this.audio.playDragonBallCollect();
            } else {
                this.audio.playCoin(); // Fallback
            }
            
            if (this.dragonBallCount >= 7) {
                this.activateShield();
            }
        }
    }
    
    updateDragonBallUI() {
        this.dbSlots.forEach((slot, index) => {
            if (index < this.dragonBallCount) {
                slot.classList.add('active');
            } else {
                slot.classList.remove('active');
            }
        });
    }
    
    triggerFateCard() {
        this.gameState = 'fate'; // Custom state
        
        // Pause physics
        this.plane.body.setVelocity(0, 0);
        this.plane.body.moves = false;
        
        // Show Fate UI
        this.fateScreen.classList.remove('hidden');
        this.fateCard.classList.remove('flipped');
        this.fateInstruction.classList.add('hidden'); // Hide instruction
        this.fateCardFront.className = 'card-face card-front'; // Reset classes
        this.fateIcon.textContent = '';
        this.fateTitle.textContent = '';
        this.fateDesc.textContent = '';
        
        // Auto reveal after short delay
        setTimeout(() => {
            this.revealFate();
        }, 500);
    }
    
    revealFate() {
        this.fateCard.classList.add('flipped');
        
        // Logic: 10% Curse, 90% Blessing
        const roll = Math.random();
        const isCurse = roll < 0.1;
        
        let result = {};
        
        if (isCurse) {
            result = this.applyCurse();
        } else {
            result = this.applyBlessing();
        }
        
        // Play sound
        if (this.audio.playCardFlip) {
            this.audio.playCardFlip();
        }
        
        // Add buff and update UI
        this.addBuff(result);
        
        // Auto continue after showing result
        setTimeout(() => {
            this.resumeFromFate();
        }, 2000);
    }
    
    addBuff(buff) {
        // Add to list
        this.activeBuffs.push(buff);
        
        // Maintain max 3
        if (this.activeBuffs.length > 3) {
            this.activeBuffs.shift();
        }
        
        // Apply effects
        this.applyActiveBuffs();
        
        // Update UI
        this.updateFateStatusUI();
    }
    
    applyActiveBuffs() {
        let totalGravityMod = 1.0;
        let totalSpeedMod = 1.0;
        let totalScoreMod = 1.0;
        
        this.activeBuffs.forEach(buff => {
            if (buff.type === 'gravity') {
                totalGravityMod *= buff.value;
            } else if (buff.type === 'speed') {
                totalSpeedMod *= buff.value;
            } else if (buff.type === 'score') {
                totalScoreMod *= buff.value;
            }
        });
        
        this.plane.setFateModifiers(totalGravityMod, totalSpeedMod);
        this.scoreMultiplier = totalScoreMod;
    }
    
    updateFateStatusUI() {
        // Clear container
        this.fateStatusContainer.innerHTML = '';
        
        if (this.activeBuffs.length > 0) {
            this.fateStatusContainer.classList.remove('hidden');
            
            // Render each buff
            this.activeBuffs.forEach(buff => {
                const card = document.createElement('div');
                card.className = `mini-card ${buff.rarity}`;
                card.innerHTML = `
                    <div class="fate-status-icon">${buff.icon}</div>
                    <div class="fate-status-text">
                        <div class="fate-status-title">${buff.title}</div>
                        <div class="fate-status-desc">${buff.desc}</div>
                    </div>
                `;
                this.fateStatusContainer.appendChild(card);
            });
        } else {
            this.fateStatusContainer.classList.add('hidden');
        }
    }
    
    applyCurse() {
        this.fateCardFront.classList.add('curse');
        this.fateIcon.textContent = '💀';
        this.fateTitle.textContent = 'CURSE';
        
        // Gravity increase: 10% - 30%
        const severity = 0.1 + Math.random() * 0.2;
        
        const desc = `Gravity +${Math.round(severity * 100)}%`;
        this.fateDesc.textContent = desc;
        
        // Shake effect
        this.cameras.main.shake(500, 0.02);
        
        // Sound
        if (this.audio.playCurse) {
            this.audio.playCurse();
        }
        
        return {
            type: 'gravity',
            value: 1 + severity,
            rarity: 'curse',
            icon: '💀',
            title: 'CURSE',
            desc: desc
        };
    }
    
    applyBlessing() {
        // Roll for Rarity: Common (0-50), Rare (51-80), Epic (81-95), Legendary (96-100)
        const roll = Math.random() * 100;
        let rarity = 'common';
        let multiplierRange = [0.05, 0.10];
        
        if (roll > 95) {
            rarity = 'legendary';
            multiplierRange = [0.36, 0.60];
        } else if (roll > 80) {
            rarity = 'epic';
            multiplierRange = [0.21, 0.35];
        } else if (roll > 50) {
            rarity = 'rare';
            multiplierRange = [0.11, 0.20];
        }
        
        this.fateCardFront.classList.add(rarity);
        
        // Roll for Type: Gravity Down, Speed Up, Score Multiplier
        const typeRoll = Math.random();
        const value = multiplierRange[0] + Math.random() * (multiplierRange[1] - multiplierRange[0]);
        
        let icon = '';
        let title = '';
        let desc = '';
        let type = '';
        let modValue = 0;
        
        if (typeRoll < 0.33) {
            // Gravity Down (Lightness)
            icon = '🪶';
            title = 'LIGHTNESS';
            desc = `Gravity -${Math.round(value * 100)}%`;
            type = 'gravity';
            modValue = 1 - value;
        } else if (typeRoll < 0.66) {
            // Speed Up (Turbo)
            icon = '⚡';
            title = 'TURBO';
            desc = `Speed +${Math.round(value * 100)}%`;
            type = 'speed';
            modValue = 1 + value;
        } else {
            // Score Multiplier (Greed)
            icon = '💰';
            title = 'GREED';
            desc = `Score x${(1 + value).toFixed(1)}`;
            type = 'score';
            modValue = 1 + value;
        }
        
        this.fateIcon.textContent = icon;
        this.fateTitle.textContent = title;
        this.fateDesc.textContent = desc;
        
        // Sound
        if (this.audio.playBlessing) {
            this.audio.playBlessing(rarity);
        }
        
        return {
            type: type,
            value: modValue,
            rarity: rarity,
            icon: icon,
            title: title,
            desc: desc
        };
    }
    
    resumeFromFate() {
        this.fateScreen.classList.add('hidden');
        this.gameState = GameState.PLAYING;
        this.plane.body.moves = true;
    }

    activateShield() {
        this.hasShield = true;
        this.dragonBallCount = 0;
        this.updateDragonBallUI();
        
        // Show indicator
        this.shieldIndicator.classList.remove('hidden');
        
        // Create shield sprite
        this.shieldSprite = this.add.sprite(this.plane.x, this.plane.y, 'shield');
        this.shieldSprite.setDepth(10); // Above plane
        this.shieldSprite.setAlpha(0.8);
        
        // Play sound
        if (this.audio.playShieldActivate) {
            this.audio.playShieldActivate();
        }
        
        // Effect
        this.cameras.main.flash(500, 0, 210, 211); // Cyan flash
    }
    
    useShield() {
        this.hasShield = false;
        this.shieldIndicator.classList.add('hidden');
        
        if (this.shieldSprite) {
            this.shieldSprite.destroy();
            this.shieldSprite = null;
        }
        
        // Super bounce
        this.plane.body.setVelocityY(-800); // Strong bounce
        this.cameras.main.shake(300, 0.02);
        this.cameras.main.flash(300, 0, 210, 211);
        
        // Sound
        if (this.audio.playShieldBreak) {
            this.audio.playShieldBreak();
        }
    }

    gameOver() {
        // Check for shield
        if (this.hasShield) {
            this.useShield();
            return;
        }

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
