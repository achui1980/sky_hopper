/**
 * Plane.js - Player-controlled plane (Phaser Sprite version)
 */

import Phaser from 'phaser';

export default class Plane extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'plane');

        // Physics properties
        this.scene = scene;
        
        // Movement properties
        this.moveSpeed = 300;
        this.currentMoveSpeed = this.moveSpeed;
        this.jumpForce = -450;  // Reduced from -600 for shorter jumps
        this.baseGravityY = 400;
        this.gravityMultiplier = 1.0;
        this.gravityModifier = 1.0; // From Fate Cards (Curse/Blessing)
        this.speedModifier = 1.0; // From Fate Cards

        // Visual state
        this.facingRight = true;
        this.isGliding = false;

        // Rocket boost state
        this.isRocketBoosting = false;
        this.rocketBoostTimer = 0;
        this.rocketBoostDuration = 180; // 3 seconds at 60fps
        this.rocketBoostSpeed = -400;

        // Trail particles
        this.trailEmitter = null;

        // Store initial position
        this.initialX = x;
        this.initialY = y;
    }

    // Initialize physics after being added to scene
    initPhysics() {
        if (!this.body) {
            this.scene.physics.add.existing(this);
        }
        
        // Set up physics body
        this.body.setCollideWorldBounds(false);
        this.body.setGravityY(this.baseGravityY);
        
        // Create trail emitter
        this.createTrailEmitter();
    }

    createTrailEmitter() {
        // Create particle emitter for rocket boost trail
        this.trailEmitter = this.scene.add.particles(0, 0, 'particle-fire', {
            speed: { min: 50, max: 150 },
            angle: { min: 80, max: 100 },
            scale: { start: 1, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 300,
            blendMode: 'ADD',
            tint: [0xff6600, 0xff9900, 0xffcc00],
            on: false
        });
        this.trailEmitter.setDepth(-1);
    }

    update(input, delta) {
        // Handle rocket boost
        if (this.isRocketBoosting) {
            this.updateRocketBoost(delta);
        } else {
            // Gliding mechanic
            // Can only glide if falling (velocity > 0) and input.up is pressed
            if (input.up && this.body.velocity.y > 0) {
                this.isGliding = true;
                
                // Reduce gravity significantly for gliding effect (10% of base)
                // Also account for gravityModifier (e.g. if cursed, gliding is harder)
                this.body.setGravityY(this.baseGravityY * 0.1 * this.gravityModifier);
                
                // Cap terminal velocity to simulate air resistance/hovering
                if (this.body.velocity.y > 50) {
                    this.body.setVelocityY(50);
                }
                
                // Increase horizontal speed while gliding
                this.currentMoveSpeed = this.moveSpeed * 1.5 * this.speedModifier;
                
                // Visual feedback: tilt plane slightly
                this.setAngle(this.facingRight ? -10 : 10);
            } else {
                this.isGliding = false;
                
                // Restore gravity based on current biome multiplier AND fate modifier
                this.body.setGravityY(this.baseGravityY * this.gravityMultiplier * this.gravityModifier);
                
                // Reset horizontal speed with modifier
                this.currentMoveSpeed = this.moveSpeed * this.speedModifier;
                
                // Reset angle
                this.setAngle(0);
            }
        }

        // Handle horizontal movement
        if (input.left) {
            this.body.setVelocityX(-this.currentMoveSpeed);
            this.setFlipX(true);
            this.facingRight = false;
            if (this.isGliding) this.setAngle(10); // Tilt other way when gliding left
        } else if (input.right) {
            this.body.setVelocityX(this.currentMoveSpeed);
            this.setFlipX(false);
            this.facingRight = true;
            if (this.isGliding) this.setAngle(-10); // Tilt other way when gliding right
        } else {
            this.body.setVelocityX(this.body.velocity.x * 0.85);
        }

        // Screen wrap (Pac-Man style)
        if (this.x + this.width < 0) {
            this.x = this.scene.gameWidth + this.width;
        } else if (this.x - this.width > this.scene.gameWidth) {
            this.x = -this.width;
        }

        // Update trail position
        if (this.trailEmitter && this.isRocketBoosting) {
            this.trailEmitter.setPosition(this.x, this.y + this.height / 2);
        }
    }

    updateRocketBoost(delta) {
        this.rocketBoostTimer -= delta;

        // Strong upward velocity
        this.body.setVelocityY(this.rocketBoostSpeed);

        // Change texture to boosting
        if (this.texture.key !== 'plane-boost') {
            this.setTexture('plane-boost');
        }

        if (this.rocketBoostTimer <= 0) {
            this.isRocketBoosting = false;
            this.setTexture('plane');
            this.body.setVelocityY(-200); // Small upward velocity when boost ends
            this.trailEmitter.stop();
            
            // Stop rocket sound
            if (this.scene.audio) {
                this.scene.audio.stopRocket();
            }
        }
    }

    activateRocketBoost() {
        this.isRocketBoosting = true;
        this.rocketBoostTimer = this.rocketBoostDuration * 16.67; // Convert frames to ms (60fps)
        this.trailEmitter.start();
        
        // Play rocket boost sound
        if (this.scene.audio) {
            this.scene.audio.playRocket();
        }
    }

    bounce() {
        // Jump when hitting a cloud
        const jumpMultiplier = this.gravityMultiplier < 1 ? 0.85 : 1;
        this.body.setVelocityY(this.jumpForce * jumpMultiplier);
        
        // Play bounce sound
        if (this.scene.audio) {
            this.scene.audio.playBounce();
        }
    }

    setGravityMultiplier(multiplier) {
        this.gravityMultiplier = multiplier;
        // Re-apply gravity with both multipliers
        if (!this.isGliding) {
            this.body.setGravityY(this.baseGravityY * this.gravityMultiplier * this.gravityModifier);
        }
    }

    setFateModifiers(gravityMod, speedMod) {
        this.gravityModifier = gravityMod;
        this.speedModifier = speedMod;
        
        // Update current physics
        this.currentMoveSpeed = this.moveSpeed * this.speedModifier;
        if (!this.isGliding && !this.isRocketBoosting) {
            this.body.setGravityY(this.baseGravityY * this.gravityMultiplier * this.gravityModifier);
        }
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.body.setVelocity(0, 0);
        this.facingRight = true;
        this.setFlipX(false);
        this.isRocketBoosting = false;
        this.isGliding = false;
        this.rocketBoostTimer = 0;
        this.setTexture('plane');
        this.gravityMultiplier = 1.0;
        this.gravityModifier = 1.0;
        this.speedModifier = 1.0;
        this.body.setGravityY(this.baseGravityY);
        this.currentMoveSpeed = this.moveSpeed;
        this.setAngle(0);
        if (this.trailEmitter) {
            this.trailEmitter.stop();
        }
        // Stop any playing rocket sound
        if (this.scene.audio) {
            this.scene.audio.stopRocket();
        }
    }
}
