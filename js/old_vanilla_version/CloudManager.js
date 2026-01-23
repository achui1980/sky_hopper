/**
 * CloudManager.js - Handles cloud spawning, recycling, and collision
 * v2.0 - Added biome-based spawning, moving clouds, and collectibles
 */

import Cloud, { CloudType, CloudVisual } from './Cloud.js';
import Collectible, { CollectibleType } from './Collectible.js';
import { randomInt, randomRange } from './Utils.js';
import { Biome, BIOME_THRESHOLDS } from './Game.js';

export default class CloudManager {
    constructor(game) {
        this.game = game;
        this.clouds = [];
        this.collectibles = [];
        
        // Spawning parameters
        this.cloudWidth = 80;
        this.minGapY = 50;          // Minimum vertical gap between clouds
        this.maxGapY = 100;         // Maximum vertical gap (must be jumpable)
        this.minX = 10;
        this.maxX = game.width - this.cloudWidth - 10;
        
        // Track the highest cloud for spawning new ones
        this.highestCloudY = game.height;
        
        // Base difficulty scaling
        this.greyCloudChance = 0.15;
        this.thunderCloudChance = 0.05;

        // Collectible spawn rates
        this.coinChance = 0.15;
        this.rocketChance = 0.03;
    }

    init() {
        this.clouds = [];
        this.collectibles = [];
        this.highestCloudY = this.game.height;
        
        // Create initial set of clouds
        // First cloud directly under the plane for guaranteed start
        const startCloud = new Cloud(
            this.game.width / 2 - this.cloudWidth / 2,
            this.game.height - 100,
            CloudType.WHITE
        );
        this.clouds.push(startCloud);
        this.highestCloudY = startCloud.y;
        
        // Generate clouds upward
        for (let i = 0; i < 15; i++) {
            this.spawnCloud();
        }
    }

    getCurrentBiome() {
        return this.game.getCurrentBiome();
    }

    spawnCloud() {
        const biome = this.getCurrentBiome();
        
        // Calculate new cloud position
        let gapY = randomRange(this.minGapY, this.maxGapY);
        
        // Increase gap slightly in higher biomes
        if (biome === Biome.STRATOSPHERE) {
            gapY *= 1.1;
        } else if (biome === Biome.SPACE) {
            gapY *= 1.15;
        }

        const newY = this.highestCloudY - gapY;
        const newX = randomInt(this.minX, this.maxX);
        
        // Determine cloud type based on score/difficulty
        let type = CloudType.WHITE;
        const roll = Math.random();
        
        // Increase difficulty based on score
        const difficultyMod = Math.min(this.game.score / 5000, 1);
        let adjustedThunderChance = this.thunderCloudChance + (difficultyMod * 0.1);
        let adjustedGreyChance = this.greyCloudChance + (difficultyMod * 0.15);

        // Biome-specific adjustments
        if (biome === Biome.SPACE) {
            adjustedGreyChance *= 1.5; // More fragile platforms in space
        }
        
        if (roll < adjustedThunderChance) {
            type = CloudType.THUNDER;
        } else if (roll < adjustedThunderChance + adjustedGreyChance) {
            type = CloudType.GREY;
        }

        // Determine cloud options based on biome
        const options = this.getCloudOptions(biome, type);
        
        const cloud = new Cloud(newX, newY, type, options);
        this.clouds.push(cloud);
        this.highestCloudY = newY;

        // Maybe spawn a collectible above the cloud
        this.maybeSpawnCollectible(newX, newY, type);
    }

    getCloudOptions(biome, type) {
        const options = {};

        // Visual style based on biome
        if (biome === Biome.SPACE) {
            // Space uses meteors and satellites
            options.visual = Math.random() < 0.6 ? CloudVisual.METEOR : CloudVisual.SATELLITE;
            
            // Meteors rotate slowly
            if (options.visual === CloudVisual.METEOR) {
                options.rotationSpeed = 0.01 + Math.random() * 0.02;
            }
        } else {
            options.visual = CloudVisual.CLOUD;
        }

        // Moving clouds in stratosphere and space
        if (biome === Biome.STRATOSPHERE || biome === Biome.SPACE) {
            // 40% chance of moving platform in stratosphere, 60% in space
            const moveChance = biome === Biome.SPACE ? 0.6 : 0.4;
            
            if (Math.random() < moveChance && type !== CloudType.THUNDER) {
                options.vx = (Math.random() < 0.5 ? -1 : 1) * (1 + Math.random() * 1.5);
                options.moveRange = 40 + Math.random() * 40;
            }
        }

        return options;
    }

    maybeSpawnCollectible(cloudX, cloudY, cloudType) {
        // Don't spawn collectibles on thunder clouds
        if (cloudType === CloudType.THUNDER) return;

        const roll = Math.random();
        
        if (roll < this.rocketChance) {
            // Spawn rocket
            const collectible = new Collectible(
                cloudX + this.cloudWidth / 2 - 10,
                cloudY - 40,
                CollectibleType.ROCKET
            );
            this.collectibles.push(collectible);
        } else if (roll < this.rocketChance + this.coinChance) {
            // Spawn coin
            const collectible = new Collectible(
                cloudX + this.cloudWidth / 2 - 10,
                cloudY - 35,
                CollectibleType.COIN
            );
            this.collectibles.push(collectible);
        }
    }

    update() {
        // Update all clouds
        for (const cloud of this.clouds) {
            cloud.update();
        }

        // Update all collectibles
        for (const collectible of this.collectibles) {
            collectible.update();
        }
        
        // Remove destroyed clouds
        this.clouds = this.clouds.filter(cloud => !cloud.destroyed);
        
        // Remove clouds that are below the screen
        this.clouds = this.clouds.filter(cloud => cloud.y < this.game.height + 50);

        // Remove collected or off-screen collectibles
        this.collectibles = this.collectibles.filter(c => 
            !c.collected && c.y < this.game.height + 50
        );
        
        // Spawn new clouds above if needed
        while (this.highestCloudY > -100) {
            this.spawnCloud();
        }
        
        // Recalculate highest cloud after cleanup
        if (this.clouds.length > 0) {
            this.highestCloudY = Math.min(...this.clouds.map(c => c.y));
        }
    }

    /**
     * Move all clouds and collectibles down (camera scroll effect)
     */
    scrollDown(amount) {
        for (const cloud of this.clouds) {
            cloud.y += amount;
            cloud.startX = cloud.startX; // Keep startX for movement reference
        }
        for (const collectible of this.collectibles) {
            collectible.y += amount;
        }
        this.highestCloudY += amount;
    }

    /**
     * Check collision with plane (one-way platform logic)
     * Only triggers when plane is falling and was above the cloud
     */
    checkCollision(plane) {
        // Only check when falling
        if (plane.vy <= 0) return null;
        
        const planeBounds = plane.getBounds();
        const planeBottom = planeBounds.y + planeBounds.height;
        const planePrevBottom = planeBottom - plane.vy; // Where plane was last frame
        
        for (const cloud of this.clouds) {
            if (cloud.destroyed) continue;
            
            const cloudBounds = cloud.getBounds();
            
            // Check if plane is horizontally aligned with cloud
            const horizontalOverlap = 
                planeBounds.x < cloudBounds.x + cloudBounds.width &&
                planeBounds.x + planeBounds.width > cloudBounds.x;
            
            if (!horizontalOverlap) continue;
            
            // Check if plane crossed through the cloud top this frame
            const crossedCloudTop = 
                planePrevBottom <= cloudBounds.y &&
                planeBottom >= cloudBounds.y;
            
            // Also check if plane is landing on top portion of cloud
            const landingOnTop = 
                planeBottom >= cloudBounds.y &&
                planeBottom <= cloudBounds.y + cloudBounds.height / 2 + plane.vy;
            
            if (crossedCloudTop || landingOnTop) {
                return cloud;
            }
        }
        
        return null;
    }

    /**
     * Check collision with collectibles
     */
    checkCollectibleCollision(plane) {
        const planeBounds = plane.getBounds();

        for (const collectible of this.collectibles) {
            if (collectible.collected) continue;

            const cBounds = collectible.getBounds();

            // Simple AABB collision
            const collides = 
                planeBounds.x < cBounds.x + cBounds.width &&
                planeBounds.x + planeBounds.width > cBounds.x &&
                planeBounds.y < cBounds.y + cBounds.height &&
                planeBounds.y + planeBounds.height > cBounds.y;

            if (collides) {
                return collectible;
            }
        }

        return null;
    }

    draw(ctx) {
        // Draw clouds
        for (const cloud of this.clouds) {
            cloud.draw(ctx);
        }

        // Draw collectibles
        for (const collectible of this.collectibles) {
            collectible.draw(ctx);
        }
    }

    reset() {
        this.init();
    }
}
