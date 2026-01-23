/**
 * Cloud.js - Cloud platforms with different types and visuals
 * v2.0 - Added moving platforms and space visuals (Meteor, Satellite)
 */

// Cloud types
export const CloudType = {
    WHITE: 'white',    // Normal - infinite bounces
    GREY: 'grey',      // Fragile - disappears after one bounce
    THUNDER: 'thunder' // Deadly - instant game over
};

// Visual styles based on biome
export const CloudVisual = {
    CLOUD: 'cloud',     // Sky biome - fluffy clouds
    METEOR: 'meteor',   // Space biome - rocky meteor
    SATELLITE: 'satellite' // Space biome - metallic platform
};

export default class Cloud {
    constructor(x, y, type = CloudType.WHITE, options = {}) {
        this.x = x;
        this.y = y;
        this.width = 80;
        this.height = 20;
        this.type = type;
        this.destroyed = false;
        
        // Movement (for stratosphere moving clouds)
        this.vx = options.vx || 0;
        this.moveRange = options.moveRange || 0;
        this.startX = x;

        // Visual style
        this.visual = options.visual || CloudVisual.CLOUD;
        
        // Animation properties
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.05;

        // Rotation for meteors
        this.rotation = 0;
        this.rotationSpeed = options.rotationSpeed || 0;
    }

    update() {
        // Gentle wobble animation
        this.wobble += this.wobbleSpeed;

        // Horizontal movement (ping-pong)
        if (this.vx !== 0) {
            this.x += this.vx;
            
            // Reverse direction at range limits
            if (this.moveRange > 0) {
                if (this.x > this.startX + this.moveRange) {
                    this.x = this.startX + this.moveRange;
                    this.vx = -Math.abs(this.vx);
                } else if (this.x < this.startX - this.moveRange) {
                    this.x = this.startX - this.moveRange;
                    this.vx = Math.abs(this.vx);
                }
            }
        }

        // Rotation for meteors
        if (this.rotationSpeed) {
            this.rotation += this.rotationSpeed;
        }
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    onBounce() {
        if (this.type === CloudType.GREY) {
            this.destroyed = true;
        }
    }

    draw(ctx) {
        if (this.destroyed) return;

        ctx.save();
        
        // Slight floating effect
        const offsetY = Math.sin(this.wobble) * 2;

        // Draw based on visual style
        switch (this.visual) {
            case CloudVisual.METEOR:
                this.drawMeteor(ctx, offsetY);
                break;
            case CloudVisual.SATELLITE:
                this.drawSatellite(ctx, offsetY);
                break;
            default:
                // Original cloud drawing based on type
                switch (this.type) {
                    case CloudType.WHITE:
                        this.drawWhiteCloud(ctx, offsetY);
                        break;
                    case CloudType.GREY:
                        this.drawGreyCloud(ctx, offsetY);
                        break;
                    case CloudType.THUNDER:
                        this.drawThunderCloud(ctx, offsetY);
                        break;
                }
        }
        
        ctx.restore();
    }

    drawMeteor(ctx, offsetY) {
        const y = this.y + offsetY;
        const centerX = this.x + this.width / 2;
        const centerY = y + this.height / 2;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(this.rotation);

        // Rocky brown/grey gradient
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width / 2);
        gradient.addColorStop(0, '#8B7355');
        gradient.addColorStop(0.7, '#5D4E37');
        gradient.addColorStop(1, '#3D3225');

        ctx.fillStyle = gradient;

        // Draw irregular rock shape
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width / 2, this.height / 1.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Add crater details
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(-10, -3, 6, 0, Math.PI * 2);
        ctx.arc(15, 2, 4, 0, Math.PI * 2);
        ctx.arc(5, -5, 3, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.ellipse(-10, -5, 8, 4, -0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Thunder meteor has electric effect
        if (this.type === CloudType.THUNDER) {
            this.drawElectricEffect(ctx, this.x + this.width / 2, y + this.height / 2);
        }
    }

    drawSatellite(ctx, offsetY) {
        const y = this.y + offsetY;
        const centerX = this.x + this.width / 2;

        // Main body (metallic rectangle)
        const gradient = ctx.createLinearGradient(this.x, y, this.x, y + this.height);
        gradient.addColorStop(0, '#C0C0C0');
        gradient.addColorStop(0.5, '#808080');
        gradient.addColorStop(1, '#A0A0A0');

        ctx.fillStyle = gradient;
        ctx.fillRect(this.x + 15, y, this.width - 30, this.height);

        // Solar panels (left and right)
        ctx.fillStyle = '#1a237e';
        ctx.fillRect(this.x, y + 2, 15, this.height - 4);
        ctx.fillRect(this.x + this.width - 15, y + 2, 15, this.height - 4);

        // Panel grid lines
        ctx.strokeStyle = '#3949ab';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(this.x + 5 * i, y + 2);
            ctx.lineTo(this.x + 5 * i, y + this.height - 2);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(this.x + this.width - 15 + 5 * i, y + 2);
            ctx.lineTo(this.x + this.width - 15 + 5 * i, y + this.height - 2);
            ctx.stroke();
        }

        // Antenna
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, y);
        ctx.lineTo(centerX, y - 8);
        ctx.stroke();

        // Blinking light
        if (Math.sin(this.wobble * 3) > 0) {
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(centerX, y - 8, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Thunder satellite has electric effect
        if (this.type === CloudType.THUNDER) {
            this.drawElectricEffect(ctx, centerX, y + this.height / 2);
        }
    }

    drawElectricEffect(ctx, x, y) {
        ctx.strokeStyle = '#ffeb3b';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#ffeb3b';
        ctx.shadowBlur = 10;

        // Random lightning bolts
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            let bx = x + (Math.random() - 0.5) * 40;
            let by = y;
            ctx.moveTo(bx, by);
            
            for (let j = 0; j < 3; j++) {
                bx += (Math.random() - 0.5) * 15;
                by += 8 + Math.random() * 5;
                ctx.lineTo(bx, by);
            }
            ctx.stroke();
        }
    }

    drawWhiteCloud(ctx, offsetY) {
        const y = this.y + offsetY;
        
        // Cloud gradient
        const gradient = ctx.createLinearGradient(this.x, y, this.x, y + this.height);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(1, '#e8e8e8');
        
        ctx.fillStyle = gradient;
        
        // Draw fluffy cloud shape
        this.drawCloudShape(ctx, this.x, y);
        
        // Add subtle shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.beginPath();
        ctx.ellipse(
            this.x + this.width / 2,
            y + this.height + 5,
            this.width / 2.5,
            3,
            0, 0, Math.PI * 2
        );
        ctx.fill();
    }

    drawGreyCloud(ctx, offsetY) {
        const y = this.y + offsetY;
        
        // Slightly transparent grey
        const gradient = ctx.createLinearGradient(this.x, y, this.x, y + this.height);
        gradient.addColorStop(0, '#b0b0b0');
        gradient.addColorStop(1, '#888888');
        
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.8;
        
        this.drawCloudShape(ctx, this.x, y);
        
        // Cracked/dashed appearance
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(this.x + 20, y + this.height / 2);
        ctx.lineTo(this.x + this.width - 20, y + this.height / 2);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    drawThunderCloud(ctx, offsetY) {
        const y = this.y + offsetY;
        
        // Dark menacing gradient
        const gradient = ctx.createLinearGradient(this.x, y, this.x, y + this.height);
        gradient.addColorStop(0, '#4a4a4a');
        gradient.addColorStop(1, '#2a2a2a');
        
        ctx.fillStyle = gradient;
        this.drawCloudShape(ctx, this.x, y);
        
        // Draw lightning bolt
        ctx.fillStyle = '#ffeb3b';
        ctx.beginPath();
        const boltX = this.x + this.width / 2;
        const boltY = y + 5;
        ctx.moveTo(boltX, boltY);
        ctx.lineTo(boltX - 5, boltY + 8);
        ctx.lineTo(boltX, boltY + 8);
        ctx.lineTo(boltX - 3, boltY + 16);
        ctx.lineTo(boltX + 5, boltY + 6);
        ctx.lineTo(boltX + 2, boltY + 6);
        ctx.lineTo(boltX + 5, boltY);
        ctx.closePath();
        ctx.fill();
        
        // Glow effect
        ctx.shadowColor = '#ffeb3b';
        ctx.shadowBlur = 10;
        ctx.fill();
    }

    drawCloudShape(ctx, x, y) {
        ctx.beginPath();
        
        // Draw rounded rectangle with bumps (cloud shape)
        const radius = this.height / 2;
        
        // Main body
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + this.width - radius, y);
        ctx.arc(x + this.width - radius, y + radius, radius, -Math.PI / 2, Math.PI / 2);
        ctx.lineTo(x + radius, y + this.height);
        ctx.arc(x + radius, y + radius, radius, Math.PI / 2, -Math.PI / 2);
        
        ctx.closePath();
        ctx.fill();
        
        // Add bumps on top for fluffy look
        ctx.beginPath();
        ctx.arc(x + this.width * 0.3, y + 2, 12, 0, Math.PI * 2);
        ctx.arc(x + this.width * 0.6, y, 14, 0, Math.PI * 2);
        ctx.fill();
    }
}
