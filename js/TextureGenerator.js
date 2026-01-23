/**
 * TextureGenerator.js - Generate all game textures programmatically using Phaser Graphics
 */

/**
 * Generate all textures needed for the game
 * @param {Phaser.Scene} scene - The scene to create textures in
 */
export function generateTextures(scene) {
    generatePlaneTexture(scene);
    generatePlaneBoostTexture(scene);
    generateCloudTextures(scene);
    generateCollectibleTextures(scene);
    generateSpaceTextures(scene);
    generateParticleTextures(scene);
}

/**
 * Generate the biplane texture
 */
function generatePlaneTexture(scene) {
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    const width = 50;
    const height = 30;

    // Body
    graphics.fillStyle(0xe74c3c);
    graphics.fillRect(0, height / 4, width * 0.8, height / 2);

    // Wings (top and bottom)
    graphics.fillStyle(0xc0392b);
    graphics.fillRect(5, 0, width * 0.6, 6);
    graphics.fillRect(5, height - 9, width * 0.6, 6);

    // Tail
    graphics.fillStyle(0xc0392b);
    graphics.beginPath();
    graphics.moveTo(0, height / 4);
    graphics.lineTo(-10, 0);
    graphics.lineTo(0, height * 3 / 4);
    graphics.closePath();
    graphics.fillPath();

    // Propeller
    graphics.fillStyle(0x333333);
    graphics.fillRect(width - 10, 5, 8, height - 10);

    // Cockpit
    graphics.fillStyle(0x3498db);
    graphics.fillRect(width / 2 - 5, height / 4 + 2, 15, height / 2 - 4);

    graphics.generateTexture('plane', width, height);
    graphics.destroy();
}

/**
 * Generate the boosting plane texture
 */
function generatePlaneBoostTexture(scene) {
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    const width = 50;
    const height = 30;

    // Body (orange when boosting)
    graphics.fillStyle(0xff4500);
    graphics.fillRect(0, height / 4, width * 0.8, height / 2);

    // Wings
    graphics.fillStyle(0xcc3700);
    graphics.fillRect(5, 0, width * 0.6, 6);
    graphics.fillRect(5, height - 9, width * 0.6, 6);

    // Tail
    graphics.fillStyle(0xcc3700);
    graphics.beginPath();
    graphics.moveTo(0, height / 4);
    graphics.lineTo(-10, 0);
    graphics.lineTo(0, height * 3 / 4);
    graphics.closePath();
    graphics.fillPath();

    // Rocket exhaust
    graphics.fillStyle(0xffcc00);
    graphics.beginPath();
    graphics.moveTo(-10, height / 4);
    graphics.lineTo(-30, height / 2);
    graphics.lineTo(-10, height * 3 / 4);
    graphics.closePath();
    graphics.fillPath();

    // Cockpit
    graphics.fillStyle(0x3498db);
    graphics.fillRect(width / 2 - 5, height / 4 + 2, 15, height / 2 - 4);

    graphics.generateTexture('plane-boost', width + 30, height);
    graphics.destroy();
}

/**
 * Generate cloud textures (white, grey, thunder)
 */
function generateCloudTextures(scene) {
    const cloudWidth = 80;
    const cloudHeight = 30;

    // White cloud
    let graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    drawCloudShape(graphics, 0, 5, cloudWidth, cloudHeight - 10, 0xffffff, 0xe8e8e8);
    graphics.generateTexture('cloud-white', cloudWidth, cloudHeight);
    graphics.destroy();

    // Grey cloud (fragile)
    graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    drawCloudShape(graphics, 0, 5, cloudWidth, cloudHeight - 10, 0xb0b0b0, 0x888888);
    // Add dashed line
    graphics.lineStyle(1, 0x666666);
    graphics.beginPath();
    for (let i = 20; i < cloudWidth - 20; i += 6) {
        graphics.moveTo(i, cloudHeight / 2);
        graphics.lineTo(i + 3, cloudHeight / 2);
    }
    graphics.strokePath();
    graphics.generateTexture('cloud-grey', cloudWidth, cloudHeight);
    graphics.destroy();

    // Thunder cloud
    graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    drawCloudShape(graphics, 0, 5, cloudWidth, cloudHeight - 10, 0x4a4a4a, 0x2a2a2a);
    // Lightning bolt
    graphics.fillStyle(0xffeb3b);
    const boltX = cloudWidth / 2;
    const boltY = 10;
    graphics.beginPath();
    graphics.moveTo(boltX, boltY);
    graphics.lineTo(boltX - 5, boltY + 8);
    graphics.lineTo(boltX, boltY + 8);
    graphics.lineTo(boltX - 3, boltY + 16);
    graphics.lineTo(boltX + 5, boltY + 6);
    graphics.lineTo(boltX + 2, boltY + 6);
    graphics.lineTo(boltX + 5, boltY);
    graphics.closePath();
    graphics.fillPath();
    graphics.generateTexture('cloud-thunder', cloudWidth, cloudHeight);
    graphics.destroy();
}

/**
 * Helper function to draw cloud shape
 */
function drawCloudShape(graphics, x, y, width, height, colorTop, colorBottom) {
    const radius = height / 2;

    // Main body gradient (simulate with solid color for simplicity)
    graphics.fillStyle(colorTop);

    // Draw rounded rectangle with bumps
    graphics.beginPath();
    graphics.moveTo(x + radius, y);
    graphics.lineTo(x + width - radius, y);
    graphics.arc(x + width - radius, y + radius, radius, -Math.PI / 2, Math.PI / 2);
    graphics.lineTo(x + radius, y + height);
    graphics.arc(x + radius, y + radius, radius, Math.PI / 2, -Math.PI / 2);
    graphics.closePath();
    graphics.fillPath();

    // Add bumps on top
    graphics.fillCircle(x + width * 0.3, y + 2, 12);
    graphics.fillCircle(x + width * 0.6, y, 14);
}

/**
 * Generate collectible textures (rocket, coin)
 */
function generateCollectibleTextures(scene) {
    // Rocket
    let graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    const rocketWidth = 20;
    const rocketHeight = 30;

    // Rocket body
    graphics.fillStyle(0xe74c3c);
    graphics.beginPath();
    graphics.moveTo(rocketWidth / 2, 0); // Nose
    graphics.lineTo(rocketWidth, rocketHeight * 0.7);
    graphics.lineTo(rocketWidth - 3, rocketHeight);
    graphics.lineTo(3, rocketHeight);
    graphics.lineTo(0, rocketHeight * 0.7);
    graphics.closePath();
    graphics.fillPath();

    // Window
    graphics.fillStyle(0x3498db);
    graphics.fillCircle(rocketWidth / 2, rocketHeight * 0.4, 4);

    // Fins
    graphics.fillStyle(0xc0392b);
    graphics.beginPath();
    graphics.moveTo(0, rocketHeight * 0.6);
    graphics.lineTo(-5, rocketHeight);
    graphics.lineTo(5, rocketHeight);
    graphics.closePath();
    graphics.fillPath();

    graphics.beginPath();
    graphics.moveTo(rocketWidth, rocketHeight * 0.6);
    graphics.lineTo(rocketWidth + 5, rocketHeight);
    graphics.lineTo(rocketWidth - 5, rocketHeight);
    graphics.closePath();
    graphics.fillPath();

    // Flame
    graphics.fillStyle(0xff9900);
    graphics.beginPath();
    graphics.moveTo(3, rocketHeight);
    graphics.lineTo(rocketWidth / 2, rocketHeight + 10);
    graphics.lineTo(rocketWidth - 3, rocketHeight);
    graphics.closePath();
    graphics.fillPath();

    graphics.generateTexture('rocket', rocketWidth + 10, rocketHeight + 12);
    graphics.destroy();

    // Coin
    graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    const coinRadius = 10;

    // Outer ring
    graphics.fillStyle(0xffd700);
    graphics.fillCircle(coinRadius, coinRadius, coinRadius);

    // Inner circle
    graphics.fillStyle(0xffec8b);
    graphics.fillCircle(coinRadius, coinRadius, coinRadius * 0.7);

    // Star
    graphics.fillStyle(0xffd700);
    drawStar(graphics, coinRadius, coinRadius, 5, coinRadius * 0.5, coinRadius * 0.25);

    graphics.generateTexture('coin', coinRadius * 2, coinRadius * 2);
    graphics.destroy();
}

/**
 * Helper function to draw a star
 */
function drawStar(graphics, cx, cy, points, outerRadius, innerRadius) {
    graphics.beginPath();
    for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;

        if (i === 0) {
            graphics.moveTo(x, y);
        } else {
            graphics.lineTo(x, y);
        }
    }
    graphics.closePath();
    graphics.fillPath();
}

/**
 * Generate space-themed textures (meteor, satellite)
 */
function generateSpaceTextures(scene) {
    // Meteor
    let graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    const meteorWidth = 80;
    const meteorHeight = 30;

    // Rocky body
    graphics.fillStyle(0x8B7355);
    graphics.fillEllipse(meteorWidth / 2, meteorHeight / 2, meteorWidth / 2, meteorHeight / 1.5);

    // Darker spots (craters)
    graphics.fillStyle(0x5D4E37);
    graphics.fillCircle(meteorWidth / 2 - 10, meteorHeight / 2 - 3, 6);
    graphics.fillCircle(meteorWidth / 2 + 15, meteorHeight / 2 + 2, 4);
    graphics.fillCircle(meteorWidth / 2 + 5, meteorHeight / 2 - 5, 3);

    // Highlight
    graphics.fillStyle(0xA08060);
    graphics.fillEllipse(meteorWidth / 2 - 10, meteorHeight / 2 - 5, 8, 4);

    graphics.generateTexture('meteor', meteorWidth, meteorHeight);
    graphics.destroy();

    // Deadly Meteor (with red warning glow and lightning)
    graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    
    // Red warning glow
    graphics.fillStyle(0xff0000, 0.3);
    graphics.fillEllipse(meteorWidth / 2, meteorHeight / 2, meteorWidth / 2 + 8, meteorHeight / 1.5 + 8);
    
    // Rocky body
    graphics.fillStyle(0x8B7355);
    graphics.fillEllipse(meteorWidth / 2, meteorHeight / 2, meteorWidth / 2, meteorHeight / 1.5);

    // Darker spots (craters)
    graphics.fillStyle(0x5D4E37);
    graphics.fillCircle(meteorWidth / 2 - 10, meteorHeight / 2 - 3, 6);
    graphics.fillCircle(meteorWidth / 2 + 15, meteorHeight / 2 + 2, 4);
    graphics.fillCircle(meteorWidth / 2 + 5, meteorHeight / 2 - 5, 3);

    // Highlight
    graphics.fillStyle(0xA08060);
    graphics.fillEllipse(meteorWidth / 2 - 10, meteorHeight / 2 - 5, 8, 4);

    // Lightning bolt
    graphics.fillStyle(0xffeb3b);
    const meteorBoltX = meteorWidth / 2 + 10;
    const meteorBoltY = meteorHeight / 2 - 8;
    graphics.beginPath();
    graphics.moveTo(meteorBoltX, meteorBoltY);
    graphics.lineTo(meteorBoltX - 3, meteorBoltY + 5);
    graphics.lineTo(meteorBoltX, meteorBoltY + 5);
    graphics.lineTo(meteorBoltX - 2, meteorBoltY + 10);
    graphics.lineTo(meteorBoltX + 3, meteorBoltY + 4);
    graphics.lineTo(meteorBoltX + 1, meteorBoltY + 4);
    graphics.lineTo(meteorBoltX + 3, meteorBoltY);
    graphics.closePath();
    graphics.fillPath();

    graphics.generateTexture('meteor-deadly', meteorWidth, meteorHeight);
    graphics.destroy();

    // Satellite
    graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    const satWidth = 80;
    const satHeight = 30;

    // Main body (metallic)
    graphics.fillStyle(0xC0C0C0);
    graphics.fillRect(15, 5, satWidth - 30, satHeight - 10);

    // Solar panels
    graphics.fillStyle(0x1a237e);
    graphics.fillRect(0, 7, 15, satHeight - 14);
    graphics.fillRect(satWidth - 15, 7, 15, satHeight - 14);

    // Panel lines
    graphics.lineStyle(1, 0x3949ab);
    for (let i = 0; i < 3; i++) {
        graphics.lineBetween(5 * i, 7, 5 * i, satHeight - 7);
        graphics.lineBetween(satWidth - 15 + 5 * i, 7, satWidth - 15 + 5 * i, satHeight - 7);
    }

    // Antenna
    graphics.lineStyle(2, 0x666666);
    graphics.lineBetween(satWidth / 2, 5, satWidth / 2, 0);
    graphics.fillStyle(0xff0000);
    graphics.fillCircle(satWidth / 2, 0, 2);

    graphics.generateTexture('satellite', satWidth, satHeight + 5);
    graphics.destroy();

    // Deadly Satellite (with red warning glow and lightning)
    graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    
    // Red warning glow
    graphics.fillStyle(0xff0000, 0.3);
    graphics.fillRect(10, 0, satWidth - 20, satHeight);
    
    // Main body (metallic)
    graphics.fillStyle(0xC0C0C0);
    graphics.fillRect(15, 5, satWidth - 30, satHeight - 10);

    // Solar panels
    graphics.fillStyle(0x1a237e);
    graphics.fillRect(0, 7, 15, satHeight - 14);
    graphics.fillRect(satWidth - 15, 7, 15, satHeight - 14);

    // Panel lines
    graphics.lineStyle(1, 0x3949ab);
    for (let i = 0; i < 3; i++) {
        graphics.lineBetween(5 * i, 7, 5 * i, satHeight - 7);
        graphics.lineBetween(satWidth - 15 + 5 * i, 7, satWidth - 15 + 5 * i, satHeight - 7);
    }

    // Antenna
    graphics.lineStyle(2, 0x666666);
    graphics.lineBetween(satWidth / 2, 5, satWidth / 2, 0);
    graphics.fillStyle(0xff0000);
    graphics.fillCircle(satWidth / 2, 0, 2);

    // Lightning bolt on satellite body
    graphics.fillStyle(0xffeb3b);
    const satBoltX = satWidth / 2 + 8;
    const satBoltY = satHeight / 2 - 3;
    graphics.beginPath();
    graphics.moveTo(satBoltX, satBoltY);
    graphics.lineTo(satBoltX - 2, satBoltY + 4);
    graphics.lineTo(satBoltX, satBoltY + 4);
    graphics.lineTo(satBoltX - 2, satBoltY + 8);
    graphics.lineTo(satBoltX + 3, satBoltY + 3);
    graphics.lineTo(satBoltX + 1, satBoltY + 3);
    graphics.lineTo(satBoltX + 3, satBoltY);
    graphics.closePath();
    graphics.fillPath();

    graphics.generateTexture('satellite-deadly', satWidth, satHeight + 5);
    graphics.destroy();
}

/**
 * Generate particle textures
 */
function generateParticleTextures(scene) {
    // Fire particle (for rocket boost trail)
    let graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture('particle-fire', 8, 8);
    graphics.destroy();

    // Star particle (for background)
    graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(2, 2, 2);
    graphics.generateTexture('particle-star', 4, 4);
    graphics.destroy();
}
