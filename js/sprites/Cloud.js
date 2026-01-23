/**
 * Cloud.js - Cloud platform sprite
 */

export const CloudType = {
    WHITE: 'white',
    GREY: 'grey',
    THUNDER: 'thunder'
};

export const CloudVisual = {
    CLOUD: 'cloud',
    METEOR: 'meteor',
    SATELLITE: 'satellite'
};

export default class Cloud extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type = CloudType.WHITE, visual = CloudVisual.CLOUD) {
        // Determine texture based on visual style and type
        let texture = 'cloud-white';
        if (visual === CloudVisual.METEOR) {
            texture = type === CloudType.THUNDER ? 'meteor-deadly' : 'meteor';
        } else if (visual === CloudVisual.SATELLITE) {
            texture = type === CloudType.THUNDER ? 'satellite-deadly' : 'satellite';
        } else {
            // Cloud texture
            if (type === CloudType.GREY) {
                texture = 'cloud-grey';
            } else if (type === CloudType.THUNDER) {
                texture = 'cloud-thunder';
            }
        }

        super(scene, x, y, texture);

        this.scene = scene;
        this.cloudType = type;
        this.visual = visual;
        this.destroyed = false;

        // Movement properties (for moving platforms)
        this.vx = 0;
        this.moveRange = 0;
        this.startX = x;

        // Animation
        this.wobblePhase = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.05;
        this.initialY = y;

        // Rotation (for meteors)
        this.rotationSpeed = 0;
    }

    // Initialize physics after being added to scene
    initPhysics() {
        if (!this.body) {
            this.scene.physics.add.existing(this);
        }
        this.body.setImmovable(true);
        this.body.setAllowGravity(false);
    }

    setMovement(vx, range) {
        this.vx = vx;
        this.moveRange = range;
    }

    setRotationSpeed(speed) {
        this.rotationSpeed = speed;
    }

    update() {
        // Wobble animation - use setY to sync with physics body
        this.wobblePhase += this.wobbleSpeed;
        const offsetY = Math.sin(this.wobblePhase) * 2;
        this.setY(this.initialY + offsetY);

        // Horizontal movement (ping-pong) - use setX to sync with physics body
        if (this.vx !== 0 && this.moveRange > 0) {
            const newX = this.x + this.vx;

            if (newX > this.startX + this.moveRange) {
                this.setX(this.startX + this.moveRange);
                this.vx = -Math.abs(this.vx);
            } else if (newX < this.startX - this.moveRange) {
                this.setX(this.startX - this.moveRange);
                this.vx = Math.abs(this.vx);
            } else {
                this.setX(newX);
            }
        }

        // Rotation for meteors
        if (this.rotationSpeed) {
            this.rotation += this.rotationSpeed;
        }
    }

    onBounce() {
        if (this.cloudType === CloudType.GREY) {
            this.destroyed = true;
            this.setActive(false);
            this.setVisible(false);
        }
    }

    scrollDown(amount) {
        this.initialY += amount;
        this.setY(this.y + amount);
    }

    reset(x, y, type, visual) {
        this.setPosition(x, y);
        this.initialY = y;
        this.startX = x;
        this.cloudType = type;
        this.visual = visual;
        this.destroyed = false;
        this.vx = 0;
        this.moveRange = 0;
        this.wobblePhase = Math.random() * Math.PI * 2;
        this.rotation = 0;
        this.rotationSpeed = 0;

        // Update texture
        let texture = 'cloud-white';
        if (visual === CloudVisual.METEOR) {
            texture = type === CloudType.THUNDER ? 'meteor-deadly' : 'meteor';
        } else if (visual === CloudVisual.SATELLITE) {
            texture = type === CloudType.THUNDER ? 'satellite-deadly' : 'satellite';
        } else {
            if (type === CloudType.GREY) {
                texture = 'cloud-grey';
            } else if (type === CloudType.THUNDER) {
                texture = 'cloud-thunder';
            }
        }
        this.setTexture(texture);

        this.setActive(true);
        this.setVisible(true);
    }
}
