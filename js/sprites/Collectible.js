/**
 * Collectible.js - Collectible items (Rocket, Coin)
 */

export const CollectibleType = {
    ROCKET: 'rocket',
    COIN: 'coin',
    DRAGON_BALL: 'dragonball'
};

export default class Collectible extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type) {
        let texture = 'coin';
        if (type === CollectibleType.ROCKET) texture = 'rocket';
        else if (type === CollectibleType.DRAGON_BALL) texture = 'dragonball';
        
        super(scene, x, y, texture);

        this.scene = scene;
        this.collectibleType = type;
        this.collected = false;

        // Animation
        this.wobblePhase = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.08;
        this.glowPhase = 0;
        this.initialY = y;
    }

    // Initialize physics after being added to scene
    initPhysics() {
        if (!this.body) {
            this.scene.physics.add.existing(this);
        }
        this.body.setAllowGravity(false);
        this.body.setImmovable(true);
    }

    update() {
        if (this.collected) return;

        // Wobble animation - use setY to sync with physics body
        this.wobblePhase += this.wobbleSpeed;
        const offsetY = Math.sin(this.wobblePhase) * 3;
        this.setY(this.initialY + offsetY);

        // Glow effect (scale pulse)
        this.glowPhase += 0.1;
        const scale = 1 + Math.sin(this.glowPhase) * 0.1;
        this.setScale(scale);
    }

    collect() {
        this.collected = true;
        this.setActive(false);
        this.setVisible(false);

        // Play collection animation
        this.scene.tweens.add({
            targets: this,
            scale: 1.5,
            alpha: 0,
            duration: 200,
            ease: 'Power2'
        });
    }

    scrollDown(amount) {
        this.initialY += amount;
        this.setY(this.y + amount);
    }

    reset(x, y, type) {
        this.setPosition(x, y);
        this.initialY = y;
        this.collectibleType = type;
        this.collected = false;
        this.wobblePhase = Math.random() * Math.PI * 2;
        this.glowPhase = 0;
        this.setAlpha(1);
        this.setScale(1);

        let texture = 'coin';
        if (type === CollectibleType.ROCKET) texture = 'rocket';
        else if (type === CollectibleType.DRAGON_BALL) texture = 'dragonball';
        
        this.setTexture(texture);

        this.setActive(true);
        this.setVisible(true);
    }

    get type() {
        return this.collectibleType;
    }
}
