/**
 * Game.js - Main game controller
 * v2.0 - Starbound Aviator with Biome System
 */

import Plane from './Plane.js';
import CloudManager from './CloudManager.js';
import Input from './Input.js';
import { CloudType } from './Cloud.js';

// Game states
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    GAME_OVER: 'gameOver'
};

// Biome thresholds
export const Biome = {
    SKY: 'sky',           // 0 - 2000
    STRATOSPHERE: 'stratosphere', // 2000 - 5000
    SPACE: 'space'        // 5000+
};

export const BIOME_THRESHOLDS = {
    STRATOSPHERE: 2000,
    SPACE: 5000
};

export default class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Set game dimensions (9:16 aspect ratio)
        this.width = 400;
        this.height = 711;
        
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Game state
        this.state = GameState.MENU;
        this.score = 0;
        this.maxHeight = 0;

        // Biome/Phase logic
        this.currentBiome = Biome.SKY;
        this.stars = [];
        this.initStars();

        // Screen shake effect
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        
        // Create game objects
        this.input = new Input(canvas);
        this.plane = new Plane(this);
        this.cloudManager = new CloudManager(this);
        
        // UI elements
        this.scoreElement = document.getElementById('score');
        this.startScreen = document.getElementById('start-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.finalScoreElement = document.getElementById('final-score');
        
        // Animation frame ID for cleanup
        this.animationId = null;
        
        // Bind methods
        this.loop = this.loop.bind(this);
    }

    initStars() {
        // Pre-generate stars for space background
        this.stars = [];
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 1,
                twinkle: Math.random() * Math.PI * 2,
                twinkleSpeed: 0.02 + Math.random() * 0.05
            });
        }
    }

    getCurrentBiome() {
        if (this.score >= BIOME_THRESHOLDS.SPACE) {
            return Biome.SPACE;
        } else if (this.score >= BIOME_THRESHOLDS.STRATOSPHERE) {
            return Biome.STRATOSPHERE;
        }
        return Biome.SKY;
    }

    getGravityMultiplier() {
        // Low gravity in space!
        if (this.currentBiome === Biome.SPACE) {
            return 0.6;
        }
        return 1.0;
    }

    triggerScreenShake(intensity = 5, duration = 10) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
    }

    start() {
        this.state = GameState.PLAYING;
        this.score = 0;
        this.maxHeight = 0;
        this.currentBiome = Biome.SKY;
        
        // Reset game objects
        this.plane.reset();
        this.cloudManager.init();
        
        // Hide UI screens
        this.startScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        
        // Start the game loop
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.loop();
    }

    loop() {
        if (this.state !== GameState.PLAYING) return;
        
        this.update();
        this.draw();
        
        this.animationId = requestAnimationFrame(this.loop);
    }

    update() {
        // Update biome
        this.currentBiome = this.getCurrentBiome();

        // Update plane physics and movement
        this.plane.update(this.input);
        
        // Camera scroll logic
        // When plane goes above middle of screen, scroll world down instead
        const middleY = this.height / 2;
        
        if (this.plane.y < middleY && this.plane.vy < 0) {
            // Calculate how much to scroll
            const scrollAmount = middleY - this.plane.y;
            
            // Lock plane to middle
            this.plane.y = middleY;
            
            // Scroll clouds down
            this.cloudManager.scrollDown(scrollAmount);
            
            // Update score based on height gained
            this.maxHeight += scrollAmount;
            this.score = Math.floor(this.maxHeight);
        }
        
        // Update clouds
        this.cloudManager.update();
        
        // Check collision with clouds (skip if rocket boosting)
        if (!this.plane.isRocketBoosting) {
            const hitCloud = this.cloudManager.checkCollision(this.plane);
            
            if (hitCloud) {
                if (hitCloud.type === CloudType.THUNDER) {
                    // Game over - hit thunder cloud
                    this.gameOver();
                    return;
                } else {
                    // Bounce off cloud
                    this.plane.jump();
                    hitCloud.onBounce();
                }
            }
        }

        // Check collision with collectibles
        const hitCollectible = this.cloudManager.checkCollectibleCollision(this.plane);
        if (hitCollectible) {
            this.handleCollectible(hitCollectible);
        }
        
        // Check if plane fell off bottom of screen
        if (this.plane.y > this.height + this.plane.height) {
            this.gameOver();
            return;
        }

        // Update screen shake
        if (this.shakeDuration > 0) {
            this.shakeDuration--;
        }
        
        // Update score display
        this.scoreElement.textContent = this.score;
    }

    handleCollectible(collectible) {
        if (collectible.type === 'rocket') {
            this.plane.activateRocketBoost();
            this.triggerScreenShake(8, 15);
        } else if (collectible.type === 'coin') {
            this.score += 100;
            // Could add a visual feedback here
        }
        collectible.collected = true;
    }

    draw() {
        this.ctx.save();

        // Apply screen shake
        if (this.shakeDuration > 0) {
            const shakeX = (Math.random() - 0.5) * this.shakeIntensity;
            const shakeY = (Math.random() - 0.5) * this.shakeIntensity;
            this.ctx.translate(shakeX, shakeY);
        }

        // Clear canvas with sky gradient
        this.drawBackground();
        
        // Draw clouds
        this.cloudManager.draw(this.ctx);
        
        // Draw plane
        this.plane.draw(this.ctx);

        // Draw biome indicator (optional debug/flair)
        this.drawBiomeIndicator();

        this.ctx.restore();
    }

    drawBackground() {
        const ctx = this.ctx;

        if (this.currentBiome === Biome.SKY) {
            // Sky - Light blue gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(1, '#E0F7FA');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, this.width, this.height);
            this.drawBackgroundClouds();

        } else if (this.currentBiome === Biome.STRATOSPHERE) {
            // Stratosphere - Purple gradient
            const progress = Math.min((this.score - BIOME_THRESHOLDS.STRATOSPHERE) / (BIOME_THRESHOLDS.SPACE - BIOME_THRESHOLDS.STRATOSPHERE), 1);
            const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
            
            // Transition from purple to darker
            const r1 = Math.floor(75 - progress * 50);
            const g1 = Math.floor(0);
            const b1 = Math.floor(130 - progress * 80);
            
            gradient.addColorStop(0, `rgb(${r1}, ${g1}, ${b1})`);
            gradient.addColorStop(1, `rgb(${Math.floor(r1 * 1.5)}, ${g1}, ${Math.floor(b1 * 1.2)})`);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, this.width, this.height);

            // Start showing some stars
            this.drawStars(progress * 0.5);

        } else {
            // Space - Black with stars
            ctx.fillStyle = '#000011';
            ctx.fillRect(0, 0, this.width, this.height);
            this.drawStars(1);
        }
    }

    drawStars(alpha) {
        const ctx = this.ctx;
        
        for (const star of this.stars) {
            // Twinkle effect
            star.twinkle += star.twinkleSpeed;
            const brightness = 0.5 + Math.sin(star.twinkle) * 0.5;
            
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * brightness})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawBackgroundClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        
        // Static decorative background clouds
        const bgClouds = [
            { x: 50, y: 100, size: 60 },
            { x: 300, y: 200, size: 40 },
            { x: 150, y: 400, size: 50 },
            { x: 320, y: 550, size: 45 }
        ];
        
        for (const cloud of bgClouds) {
            // Parallax effect based on score
            const offsetY = (this.score * 0.1) % this.height;
            const y = (cloud.y + offsetY) % (this.height + cloud.size);
            
            this.ctx.beginPath();
            this.ctx.arc(cloud.x, y, cloud.size / 2, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + cloud.size * 0.4, y - 5, cloud.size / 2.5, 0, Math.PI * 2);
            this.ctx.arc(cloud.x - cloud.size * 0.3, y + 3, cloud.size / 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawBiomeIndicator() {
        // Small text showing current biome in top right
        const ctx = this.ctx;
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'right';
        
        let biomeText = '';
        let color = '#333';
        
        switch (this.currentBiome) {
            case Biome.SKY:
                biomeText = 'Sky';
                color = '#2c3e50';
                break;
            case Biome.STRATOSPHERE:
                biomeText = 'Stratosphere';
                color = '#9b59b6';
                break;
            case Biome.SPACE:
                biomeText = 'Outer Space';
                color = '#ecf0f1';
                break;
        }
        
        ctx.fillStyle = color;
        ctx.fillText(biomeText, this.width - 10, 30);
    }

    gameOver() {
        this.state = GameState.GAME_OVER;
        
        // Show game over screen
        this.gameOverScreen.classList.remove('hidden');
        this.finalScoreElement.textContent = `Score: ${this.score}`;
        
        // Cancel animation loop
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    showMenu() {
        this.state = GameState.MENU;
        this.startScreen.classList.remove('hidden');
        this.gameOverScreen.classList.add('hidden');
        
        // Draw initial background
        this.drawBackground();
    }
}
