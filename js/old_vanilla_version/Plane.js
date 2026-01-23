/**
 * Plane.js - The player-controlled aircraft
 * v2.0 - Added variable gravity and Rocket Boost
 */

export default class Plane {
    constructor(game) {
        this.game = game;
        
        // Dimensions
        this.width = 50;
        this.height = 30;
        
        // Position (start at bottom center)
        this.x = game.width / 2 - this.width / 2;
        this.y = game.height - 150;
        
        // Velocity
        this.vx = 0;
        this.vy = 0;
        
        // Physics constants (base values)
        this.baseGravity = 0.4;
        this.jumpForce = -12;
        this.moveSpeed = 6;
        this.friction = 0.85;
        
        // Visual state
        this.facingRight = true;

        // Rocket Boost state
        this.isRocketBoosting = false;
        this.rocketBoostTimer = 0;
        this.rocketBoostDuration = 180; // 3 seconds at 60fps
        this.rocketBoostSpeed = -8; // Strong upward velocity

        // Trail particles for rocket effect
        this.trail = [];
    }

    get gravity() {
        // Apply biome-based gravity multiplier
        return this.baseGravity * this.game.getGravityMultiplier();
    }

    activateRocketBoost() {
        this.isRocketBoosting = true;
        this.rocketBoostTimer = this.rocketBoostDuration;
    }

    update(input) {
        // Handle rocket boost
        if (this.isRocketBoosting) {
            this.updateRocketBoost();
        } else {
            // Apply gravity normally
            this.vy += this.gravity;
        }
        
        // Handle horizontal input
        if (input.isLeft()) {
            this.vx = -this.moveSpeed;
            this.facingRight = false;
        } else if (input.isRight()) {
            this.vx = this.moveSpeed;
            this.facingRight = true;
        } else {
            // Apply friction when no input
            this.vx *= this.friction;
        }
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Screen wrap (Pac-Man style)
        if (this.x + this.width < 0) {
            this.x = this.game.width;
        } else if (this.x > this.game.width) {
            this.x = -this.width;
        }

        // Update trail
        this.updateTrail();
    }

    updateRocketBoost() {
        this.rocketBoostTimer--;

        // Strong upward movement
        this.vy = this.rocketBoostSpeed;

        // Add trail particles
        this.trail.push({
            x: this.x + this.width / 2 + (Math.random() - 0.5) * 10,
            y: this.y + this.height,
            size: 5 + Math.random() * 5,
            life: 20,
            vx: (Math.random() - 0.5) * 2,
            vy: 3 + Math.random() * 2
        });

        if (this.rocketBoostTimer <= 0) {
            this.isRocketBoosting = false;
            this.vy = -5; // Small upward velocity when boost ends
        }
    }

    updateTrail() {
        // Update and remove old trail particles
        for (let i = this.trail.length - 1; i >= 0; i--) {
            const p = this.trail[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            p.size *= 0.95;
            
            if (p.life <= 0 || p.size < 0.5) {
                this.trail.splice(i, 1);
            }
        }
    }

    jump() {
        // Slightly stronger jump in space
        const jumpMultiplier = this.game.getGravityMultiplier() < 1 ? 0.85 : 1;
        this.vy = this.jumpForce * jumpMultiplier;
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    draw(ctx) {
        // Draw trail first (behind plane)
        this.drawTrail(ctx);

        ctx.save();
        
        // Translate to plane center for rotation
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        ctx.translate(centerX, centerY);
        
        // Flip if facing left
        if (!this.facingRight) {
            ctx.scale(-1, 1);
        }

        // Glow effect when rocket boosting
        if (this.isRocketBoosting) {
            ctx.shadowColor = '#ff6600';
            ctx.shadowBlur = 20;
        }
        
        // Draw biplane body
        ctx.fillStyle = this.isRocketBoosting ? '#ff4500' : '#e74c3c'; // Orange when boosting
        ctx.fillRect(-this.width / 2, -this.height / 4, this.width * 0.8, this.height / 2);
        
        // Draw wings (top and bottom)
        ctx.fillStyle = this.isRocketBoosting ? '#cc3700' : '#c0392b';
        ctx.fillRect(-this.width / 2 + 5, -this.height / 2, this.width * 0.6, 6);
        ctx.fillRect(-this.width / 2 + 5, this.height / 4 - 3, this.width * 0.6, 6);
        
        // Draw tail
        ctx.fillStyle = this.isRocketBoosting ? '#cc3700' : '#c0392b';
        ctx.beginPath();
        ctx.moveTo(-this.width / 2, -this.height / 4);
        ctx.lineTo(-this.width / 2 - 10, -this.height / 2);
        ctx.lineTo(-this.width / 2, this.height / 4);
        ctx.closePath();
        ctx.fill();
        
        // Draw propeller (or rocket flame when boosting)
        if (this.isRocketBoosting) {
            // Draw rocket exhaust at back
            ctx.fillStyle = '#ffcc00';
            ctx.beginPath();
            ctx.moveTo(-this.width / 2 - 10, -this.height / 4);
            ctx.lineTo(-this.width / 2 - 25 - Math.random() * 10, 0);
            ctx.lineTo(-this.width / 2 - 10, this.height / 4);
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.fillStyle = '#333';
            ctx.fillRect(this.width / 2 - 10, -this.height / 2 + 5, 8, this.height - 10);
        }
        
        // Draw cockpit
        ctx.fillStyle = '#3498db';
        ctx.fillRect(-5, -this.height / 4 + 2, 15, this.height / 2 - 4);
        
        ctx.restore();
    }

    drawTrail(ctx) {
        for (const p of this.trail) {
            const alpha = p.life / 20;
            ctx.fillStyle = `rgba(255, ${Math.floor(100 + Math.random() * 50)}, 0, ${alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    reset() {
        this.x = this.game.width / 2 - this.width / 2;
        this.y = this.game.height - 150;
        this.vx = 0;
        this.vy = 0;
        this.facingRight = true;
        this.isRocketBoosting = false;
        this.rocketBoostTimer = 0;
        this.trail = [];
    }
}
