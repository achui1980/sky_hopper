/**
 * Collectible.js - Power-ups and items (Rocket, Coin)
 */

export const CollectibleType = {
    ROCKET: 'rocket',
    COIN: 'coin'
};

export default class Collectible {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.collected = false;

        // Size varies by type
        if (type === CollectibleType.ROCKET) {
            this.width = 20;
            this.height = 30;
        } else {
            this.width = 20;
            this.height = 20;
        }

        // Animation
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.08;
        this.glowPhase = 0;
    }

    update() {
        this.wobble += this.wobbleSpeed;
        this.glowPhase += 0.1;
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
        if (this.collected) return;

        ctx.save();

        const offsetY = Math.sin(this.wobble) * 3;
        const drawY = this.y + offsetY;

        // Glow effect
        const glowIntensity = 0.3 + Math.sin(this.glowPhase) * 0.2;

        if (this.type === CollectibleType.ROCKET) {
            this.drawRocket(ctx, this.x, drawY, glowIntensity);
        } else {
            this.drawCoin(ctx, this.x, drawY, glowIntensity);
        }

        ctx.restore();
    }

    drawRocket(ctx, x, y, glow) {
        const centerX = x + this.width / 2;
        const centerY = y + this.height / 2;

        // Glow
        ctx.shadowColor = '#ff6600';
        ctx.shadowBlur = 15 * glow;

        // Rocket body
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.moveTo(centerX, y); // Nose
        ctx.lineTo(x + this.width, y + this.height * 0.7);
        ctx.lineTo(x + this.width - 3, y + this.height);
        ctx.lineTo(x + 3, y + this.height);
        ctx.lineTo(x, y + this.height * 0.7);
        ctx.closePath();
        ctx.fill();

        // Window
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.arc(centerX, y + this.height * 0.4, 4, 0, Math.PI * 2);
        ctx.fill();

        // Fins
        ctx.fillStyle = '#c0392b';
        ctx.beginPath();
        ctx.moveTo(x, y + this.height * 0.6);
        ctx.lineTo(x - 5, y + this.height);
        ctx.lineTo(x + 5, y + this.height);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x + this.width, y + this.height * 0.6);
        ctx.lineTo(x + this.width + 5, y + this.height);
        ctx.lineTo(x + this.width - 5, y + this.height);
        ctx.closePath();
        ctx.fill();

        // Flame
        ctx.fillStyle = `rgba(255, ${150 + Math.random() * 50}, 0, ${0.8 + Math.random() * 0.2})`;
        ctx.beginPath();
        ctx.moveTo(x + 3, y + this.height);
        ctx.lineTo(centerX, y + this.height + 8 + Math.random() * 4);
        ctx.lineTo(x + this.width - 3, y + this.height);
        ctx.closePath();
        ctx.fill();
    }

    drawCoin(ctx, x, y, glow) {
        const centerX = x + this.width / 2;
        const centerY = y + this.height / 2;
        const radius = this.width / 2;

        // Glow
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 12 * glow;

        // Outer ring
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner circle
        ctx.fillStyle = '#ffec8b';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Star shape in center
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        const starPoints = 5;
        const innerRadius = radius * 0.25;
        const outerRadius = radius * 0.5;
        
        for (let i = 0; i < starPoints * 2; i++) {
            const r = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / starPoints - Math.PI / 2;
            const sx = centerX + Math.cos(angle) * r;
            const sy = centerY + Math.sin(angle) * r;
            
            if (i === 0) {
                ctx.moveTo(sx, sy);
            } else {
                ctx.lineTo(sx, sy);
            }
        }
        ctx.closePath();
        ctx.fill();

        // Shine effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(centerX - 3, centerY - 3, 4, 3, -0.5, 0, Math.PI * 2);
        ctx.fill();
    }
}
