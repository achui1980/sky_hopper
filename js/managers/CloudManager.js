/**
 * CloudManager.js - Manages cloud spawning and recycling (Phaser version)
 */

import Cloud, { CloudType, CloudVisual } from '../sprites/Cloud.js';
import Collectible, { CollectibleType } from '../sprites/Collectible.js';
import { Biome, BIOME_THRESHOLDS } from '../scenes/PlayScene.js';

export default class CloudManager {
    constructor(scene) {
        this.scene = scene;

        // Cloud group (using Phaser Group for object pooling)
        this.clouds = scene.physics.add.group({
            classType: Cloud,
            maxSize: 30,
            runChildUpdate: false  // We'll manually update in CloudManager.update()
        });

        // Collectibles group
        this.collectibles = scene.physics.add.group({
            classType: Collectible,
            maxSize: 20,
            runChildUpdate: false  // We'll manually update in CloudManager.update()
        });

        // Spawning parameters
        this.cloudWidth = 80;
        this.minGapY = 50;
        this.maxGapY = 100;
        this.minX = 10;
        this.maxX = scene.gameWidth - this.cloudWidth - 10;

        // Track highest cloud
        this.highestCloudY = scene.gameHeight;

        // Difficulty scaling
        this.greyCloudChance = 0.15;
        this.thunderCloudChance = 0.05;

        // Collectible spawn rates
        this.coinChance = 0.15;
        this.rocketChance = 0.03;
    }

    reset() {
        // Clear all clouds and collectibles
        this.clouds.clear(true, true);
        this.collectibles.clear(true, true);
        
        this.highestCloudY = this.scene.gameHeight;

        // Create initial set of clouds
        // First cloud directly under the plane
        this.spawnCloud(
            this.scene.gameWidth / 2 - this.cloudWidth / 2,
            this.scene.gameHeight - 100,
            CloudType.WHITE,
            CloudVisual.CLOUD
        );

        // Generate clouds upward
        for (let i = 0; i < 15; i++) {
            this.spawnCloudAtTop();
        }
    }

    spawnCloudAtTop() {
        const biome = this.scene.getCurrentBiome();

        // Calculate gap
        let gapY = Phaser.Math.Between(this.minGapY, this.maxGapY);

        // Increase gap in higher biomes
        if (biome === Biome.STRATOSPHERE) {
            gapY *= 1.1;
        } else if (biome === Biome.SPACE) {
            gapY *= 1.15;
        }

        const newY = this.highestCloudY - gapY;
        const newX = Phaser.Math.Between(this.minX, this.maxX);

        // Determine cloud type based on difficulty
        let type = CloudType.WHITE;
        const roll = Math.random();

        const difficultyMod = Math.min(this.scene.score / 5000, 1);
        let adjustedThunderChance = this.thunderCloudChance + (difficultyMod * 0.1);
        let adjustedGreyChance = this.greyCloudChance + (difficultyMod * 0.15);

        // Biome-specific adjustments
        if (biome === Biome.SPACE) {
            adjustedGreyChance *= 1.5;
        }

        if (roll < adjustedThunderChance) {
            type = CloudType.THUNDER;
        } else if (roll < adjustedThunderChance + adjustedGreyChance) {
            type = CloudType.GREY;
        }

        // Determine visual style
        let visual = CloudVisual.CLOUD;
        let vx = 0;
        let moveRange = 0;
        let rotationSpeed = 0;

        if (biome === Biome.SPACE) {
            visual = Math.random() < 0.6 ? CloudVisual.METEOR : CloudVisual.SATELLITE;
            
            if (visual === CloudVisual.METEOR) {
                rotationSpeed = 0.01 + Math.random() * 0.02;
            }
        }

        // Moving platforms
        if (biome === Biome.STRATOSPHERE || biome === Biome.SPACE) {
            const moveChance = biome === Biome.SPACE ? 0.6 : 0.4;
            
            if (Math.random() < moveChance && type !== CloudType.THUNDER) {
                vx = (Math.random() < 0.5 ? -1 : 1) * (1 + Math.random() * 1.5);
                moveRange = 40 + Math.random() * 40;
            }
        }

        this.spawnCloud(newX, newY, type, visual, vx, moveRange, rotationSpeed);
        this.highestCloudY = newY;

        // Maybe spawn collectible
        this.maybeSpawnCollectible(newX, newY, type);
    }

    spawnCloud(x, y, type, visual, vx = 0, moveRange = 0, rotationSpeed = 0) {
        // Try to get inactive cloud from pool
        let cloud = this.clouds.getFirstDead(false);

        if (cloud) {
            // Reuse existing cloud
            cloud.reset(x, y, type, visual);
        } else {
            // Create new cloud
            cloud = new Cloud(this.scene, x, y, type, visual);
            this.scene.add.existing(cloud); // Add to scene first
            cloud.initPhysics(); // Initialize physics
            this.clouds.add(cloud);
        }

        if (vx !== 0) {
            cloud.setMovement(vx, moveRange);
        }

        if (rotationSpeed !== 0) {
            cloud.setRotationSpeed(rotationSpeed);
        }

        return cloud;
    }

    maybeSpawnCollectible(cloudX, cloudY, cloudType) {
        if (cloudType === CloudType.THUNDER) return;

        const roll = Math.random();

        if (roll < this.rocketChance) {
            this.spawnCollectible(
                cloudX + this.cloudWidth / 2 - 10,
                cloudY - 40,
                CollectibleType.ROCKET
            );
        } else if (roll < this.rocketChance + this.coinChance) {
            this.spawnCollectible(
                cloudX + this.cloudWidth / 2 - 10,
                cloudY - 35,
                CollectibleType.COIN
            );
        }
    }

    spawnCollectible(x, y, type) {
        let collectible = this.collectibles.getFirstDead(false);

        if (collectible) {
            collectible.reset(x, y, type);
        } else {
            collectible = new Collectible(this.scene, x, y, type);
            this.scene.add.existing(collectible); // Add to scene first
            collectible.initPhysics(); // Initialize physics
            this.collectibles.add(collectible);
        }

        return collectible;
    }

    update() {
        // Update all active clouds
        this.clouds.children.entries.forEach(cloud => {
            if (cloud.active) {
                cloud.update();
            }
        });

        // Update all active collectibles
        this.collectibles.children.entries.forEach(collectible => {
            if (collectible.active) {
                collectible.update();
            }
        });

        // Remove clouds below screen
        this.clouds.children.entries.forEach(cloud => {
            if (cloud.active && cloud.y > this.scene.gameHeight + 50) {
                cloud.setActive(false);
                cloud.setVisible(false);
            }
        });

        // Remove collectibles below screen
        this.collectibles.children.entries.forEach(collectible => {
            if (collectible.active && collectible.y > this.scene.gameHeight + 50) {
                collectible.setActive(false);
                collectible.setVisible(false);
            }
        });

        // Spawn new clouds at top
        while (this.highestCloudY > -100) {
            this.spawnCloudAtTop();
        }

        // Recalculate highest cloud
        const activeClouds = this.clouds.getChildren().filter(c => c.active);
        if (activeClouds.length > 0) {
            this.highestCloudY = Math.min(...activeClouds.map(c => c.y));
        }
    }

    scrollDown(amount) {
        this.clouds.children.entries.forEach(cloud => {
            if (cloud.active) {
                cloud.scrollDown(amount);
            }
        });

        this.collectibles.children.entries.forEach(collectible => {
            if (collectible.active) {
                collectible.scrollDown(amount);
            }
        });

        this.highestCloudY += amount;
    }

    checkCollision(plane) {
        // Only check when plane is falling
        if (plane.body.velocity.y <= 0) return null;

        const planeBounds = plane.getBounds();
        const planeBottom = planeBounds.bottom;
        
        // Use a more forgiving collision check - check if plane bottom is within a small range above cloud top
        const COLLISION_TOLERANCE = 15; // pixels of tolerance

        const activeClouds = this.clouds.getChildren().filter(c => c.active && !c.destroyed);

        for (const cloud of activeClouds) {
            const cloudBounds = cloud.getBounds();

            // Check horizontal overlap
            const horizontalOverlap = 
                planeBounds.left + 5 < cloudBounds.right &&
                planeBounds.right - 5 > cloudBounds.left;

            if (!horizontalOverlap) continue;

            // Check if plane bottom is near cloud top (landing from above)
            const distanceToCloudTop = planeBottom - cloudBounds.top;
            
            // Only trigger if plane is close to top of cloud and falling onto it
            if (distanceToCloudTop >= -COLLISION_TOLERANCE && 
                distanceToCloudTop <= COLLISION_TOLERANCE) {
                
                // Check if it's a thunder cloud (game over)
                if (cloud.cloudType === CloudType.THUNDER) {
                    // Play thunder/death sound
                    if (this.scene.audio) {
                        this.scene.audio.playThunder();
                    }
                    // Immediately stop plane movement
                    this.scene.plane.body.setVelocity(0, 0);
                    this.scene.gameOver();
                    return null;
                }
                return cloud;
            }
        }

        return null;
    }

    checkCollectibleCollision(plane) {
        const planeBounds = plane.getBounds();

        const activeCollectibles = this.collectibles.getChildren().filter(c => c.active && !c.collected);

        for (const collectible of activeCollectibles) {
            const cBounds = collectible.getBounds();

            const collides = Phaser.Geom.Intersects.RectangleToRectangle(planeBounds, cBounds);

            if (collides) {
                return collectible;
            }
        }

        return null;
    }
}
