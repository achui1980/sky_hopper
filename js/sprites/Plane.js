/**
 * Plane.js - Player-controlled plane (Phaser Sprite version)
 */

export default class Plane extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'plane');

        // Physics properties
        this.scene = scene;
        
        // Movement properties
        this.moveSpeed = 300;
        this.jumpForce = -450;  // Reduced from -600 for shorter jumps
        this.baseGravityY = 400;
        this.gravityMultiplier = 1.0;

        // Visual state
        this.facingRight = true;

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
        }

        // Handle horizontal movement
        if (input.left) {
            this.body.setVelocityX(-this.moveSpeed);
            this.setFlipX(true);
            this.facingRight = false;
        } else if (input.right) {
            this.body.setVelocityX(this.moveSpeed);
            this.setFlipX(false);
            this.facingRight = true;
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
        this.body.setGravityY(this.baseGravityY * multiplier);
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.body.setVelocity(0, 0);
        this.facingRight = true;
        this.setFlipX(false);
        this.isRocketBoosting = false;
        this.rocketBoostTimer = 0;
        this.setTexture('plane');
        this.gravityMultiplier = 1.0;
        this.body.setGravityY(this.baseGravityY);
        if (this.trailEmitter) {
            this.trailEmitter.stop();
        }
        // Stop any playing rocket sound
        if (this.scene.audio) {
            this.scene.audio.stopRocket();
        }
    }
}
