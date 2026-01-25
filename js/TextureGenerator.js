/**
 * TextureGenerator.js - Generate all game textures programmatically using Phaser Graphics
 */

/**
 * Generate all textures needed for the game
 * @param {Phaser.Scene} scene - The scene to create textures in
 */
export function generateTextures(scene) {
    generateBackgroundTexture(scene);
    generatePlaneTexture(scene);
    generatePlaneBoostTexture(scene);
    generateCloudTextures(scene);
    generateCollectibleTextures(scene);
    generateSpaceTextures(scene);
    generateParticleTextures(scene);
}

/**
 * Generate the background texture
 */
function generateBackgroundTexture(scene) {
    const width = 512; // Texture size
    const height = 512;
    
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    
    // Transparent background to let Camera background color show through
    // Only draw subtle patterns
    
    graphics.fillStyle(0xffffff, 0.1);
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = 10 + Math.random() * 40;
        graphics.fillCircle(x, y, r);
    }

    graphics.generateTexture('bg-sky', width, height);
    graphics.destroy();
}

/**
 * Generate the biplane texture
 */
function generatePlaneTexture(scene) {
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    const width = 60; // Slightly wider for better shape
    const height = 30;

    // -- Fuselage (Streamlined Body) --
    // Main body gradient (simulated with layered shapes for simplicity in Graphics)
    graphics.fillStyle(0xe74c3c); // Main Red
    
    // Draw a rounded fuselage using ellipse for the main body
    graphics.fillEllipse(width * 0.6, height * 0.5, width * 0.8, height * 0.6);
    
    // Tail section using path (lines only)
    graphics.beginPath();
    graphics.moveTo(width * 0.4, height * 0.2);
    graphics.lineTo(0, height * 0.5);
    graphics.lineTo(width * 0.4, height * 0.8);
    graphics.closePath();
    graphics.fillPath();

    // Highlight (Top)
    graphics.fillStyle(0xff7675);
    graphics.fillEllipse(width * 0.5, height * 0.3, width * 0.6, height * 0.15);

    // Shadow (Bottom)
    graphics.fillStyle(0xc0392b);
    graphics.fillEllipse(width * 0.5, height * 0.7, width * 0.5, height * 0.15);

    // -- Wings (Monoplane Style) --
    graphics.fillStyle(0xd35400); // Darker orange-red
    // Main wing (perspective view)
    graphics.beginPath();
    graphics.moveTo(width * 0.3, height * 0.4);
    graphics.lineTo(width * 0.7, height * 0.4);
    graphics.lineTo(width * 0.6, height * 0.7); // Tapered back
    graphics.lineTo(width * 0.4, height * 0.7);
    graphics.closePath();
    graphics.fillPath();

    // -- Tail Fin --
    graphics.fillStyle(0xc0392b);
    graphics.beginPath();
    graphics.moveTo(width * 0.1, height * 0.2);
    graphics.lineTo(width * 0.2, height * 0.2);
    graphics.lineTo(width * 0.05, 0); // Pointy top
    graphics.closePath();
    graphics.fillPath();

    // -- Cockpit (Bubble Canopy) --
    graphics.fillStyle(0x3498db); // Blue glass
    graphics.fillEllipse(width * 0.55, height * 0.35, width * 0.25, height * 0.2);
    // Glint
    graphics.fillStyle(0xffffff, 0.6);
    graphics.fillEllipse(width * 0.5, height * 0.3, 4, 2);

    // -- Propeller (Blurred Disc) --
    graphics.fillStyle(0x555555, 0.4); // Semi-transparent grey
    graphics.fillEllipse(width - 2, height * 0.5, 4, height * 0.8);
    // Propeller hub
    graphics.fillStyle(0x333333);
    graphics.fillCircle(width - 2, height * 0.5, 3);

    graphics.generateTexture('plane', width, height);
    graphics.destroy();
}

/**
 * Generate the boosting plane texture
 */
function generatePlaneBoostTexture(scene) {
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    const width = 60;
    const height = 30;

    // -- Fuselage (Streamlined Body - Orange/Gold for Boost) --
    graphics.fillStyle(0xff9f43); // Orange
    
    // Draw a rounded fuselage using ellipse for the main body
    graphics.fillEllipse(width * 0.6, height * 0.5, width * 0.8, height * 0.6);
    
    // Tail section using path (lines only)
    graphics.beginPath();
    graphics.moveTo(width * 0.4, height * 0.2);
    graphics.lineTo(0, height * 0.5);
    graphics.lineTo(width * 0.4, height * 0.8);
    graphics.closePath();
    graphics.fillPath();

    // Highlight
    graphics.fillStyle(0xffcd61);
    graphics.fillEllipse(width * 0.5, height * 0.3, width * 0.6, height * 0.15);

    // -- Wings --
    graphics.fillStyle(0xe67e22);
    graphics.beginPath();
    graphics.moveTo(width * 0.3, height * 0.4);
    graphics.lineTo(width * 0.7, height * 0.4);
    graphics.lineTo(width * 0.6, height * 0.7);
    graphics.lineTo(width * 0.4, height * 0.7);
    graphics.closePath();
    graphics.fillPath();

    // -- Tail Fin --
    graphics.fillStyle(0xe67e22);
    graphics.beginPath();
    graphics.moveTo(width * 0.1, height * 0.2);
    graphics.lineTo(width * 0.2, height * 0.2);
    graphics.lineTo(width * 0.05, 0);
    graphics.closePath();
    graphics.fillPath();

    // -- Cockpit --
    graphics.fillStyle(0x00d2d3); // Cyan glass
    graphics.fillEllipse(width * 0.55, height * 0.35, width * 0.25, height * 0.2);

    // -- Rocket Exhaust (Massive Flame) --
    // Outer flame
    graphics.fillStyle(0xff6b6b); // Red
    graphics.beginPath();
    graphics.moveTo(width * 0.1, height * 0.3);
    graphics.lineTo(-20, height * 0.5);
    graphics.lineTo(width * 0.1, height * 0.7);
    graphics.closePath();
    graphics.fillPath();
    
    // Inner flame
    graphics.fillStyle(0xfeca57); // Yellow
    graphics.beginPath();
    graphics.moveTo(width * 0.1, height * 0.4);
    graphics.lineTo(-10, height * 0.5);
    graphics.lineTo(width * 0.1, height * 0.6);
    graphics.closePath();
    graphics.fillPath();

    // -- Propeller (Blurred Disc - Faster) --
    graphics.fillStyle(0xffffff, 0.3);
    graphics.fillEllipse(width - 2, height * 0.5, 6, height);
    graphics.fillStyle(0x333333);
    graphics.fillCircle(width - 2, height * 0.5, 3);

    graphics.generateTexture('plane-boost', width + 20, height);
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
 * Helper function to draw cloud shape (Restored to original style)
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
    const rocketWidth = 24;
    const rocketHeight = 40;

    // -- Rocket Body (Sci-fi Metallic) --
    // Main fuselage
    graphics.fillStyle(0xdcdde1); // Light metallic grey
    
    // Use ellipse for main body shape
    graphics.fillEllipse(rocketWidth * 0.5, rocketHeight * 0.5, rocketWidth, rocketHeight * 1.5);
    
    // Cut off bottom? No need, just overlay with fins
    
    // Red Nose Cone
    graphics.fillStyle(0xe74c3c);
    // Use smaller ellipse for nose
    graphics.fillEllipse(rocketWidth * 0.5, rocketHeight * 0.15, rocketWidth * 0.8, rocketHeight * 0.4);

    // -- Fins --
    graphics.fillStyle(0xc0392b);
    // Left Fin
    graphics.beginPath();
    graphics.moveTo(rocketWidth * 0.2, rocketHeight * 0.6);
    graphics.lineTo(0, rocketHeight);
    graphics.lineTo(rocketWidth * 0.3, rocketHeight * 0.8);
    graphics.closePath();
    graphics.fillPath();
    // Right Fin
    graphics.beginPath();
    graphics.moveTo(rocketWidth * 0.8, rocketHeight * 0.6);
    graphics.lineTo(rocketWidth, rocketHeight);
    graphics.lineTo(rocketWidth * 0.7, rocketHeight * 0.8);
    graphics.closePath();
    graphics.fillPath();
    // Center Fin
    graphics.fillStyle(0xa52a2a);
    graphics.fillRect(rocketWidth * 0.45, rocketHeight * 0.6, rocketWidth * 0.1, rocketHeight * 0.4);

    // -- Window --
    // Rim
    graphics.fillStyle(0x7f8c8d);
    graphics.fillCircle(rocketWidth * 0.5, rocketHeight * 0.45, 6);
    // Glass
    graphics.fillStyle(0x3498db);
    graphics.fillCircle(rocketWidth * 0.5, rocketHeight * 0.45, 4);
    // Reflection
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(rocketWidth * 0.55, rocketHeight * 0.42, 1.5);

    // -- Flame --
    // Core
    graphics.fillStyle(0xf1c40f);
    graphics.beginPath();
    graphics.moveTo(rocketWidth * 0.3, rocketHeight * 0.85);
    graphics.lineTo(rocketWidth * 0.5, rocketHeight * 1.2);
    graphics.lineTo(rocketWidth * 0.7, rocketHeight * 0.85);
    graphics.closePath();
    graphics.fillPath();
    // Outer
    graphics.fillStyle(0xe67e22, 0.6);
    graphics.beginPath();
    graphics.moveTo(rocketWidth * 0.2, rocketHeight * 0.85);
    graphics.lineTo(rocketWidth * 0.5, rocketHeight * 1.3);
    graphics.lineTo(rocketWidth * 0.8, rocketHeight * 0.85);
    graphics.closePath();
    graphics.fillPath();

    graphics.generateTexture('rocket', rocketWidth + 10, rocketHeight + 15);
    graphics.destroy();

    // Coin
    graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    const coinRadius = 12; // Slightly larger

    // Outer ring (Gold)
    graphics.fillStyle(0xf1c40f);
    graphics.fillCircle(coinRadius, coinRadius, coinRadius);
    
    // Edge Highlight
    graphics.lineStyle(2, 0xf39c12);
    graphics.strokeCircle(coinRadius, coinRadius, coinRadius);

    // Inner circle (Lighter Gold)
    graphics.fillStyle(0xfcd670);
    graphics.fillCircle(coinRadius, coinRadius, coinRadius * 0.75);

    // Star symbol
    graphics.fillStyle(0xf39c12);
    drawStar(graphics, coinRadius, coinRadius, 5, coinRadius * 0.5, coinRadius * 0.2);
    
    // Shine
    graphics.fillStyle(0xffffff, 0.8);
    graphics.fillCircle(coinRadius * 0.6, coinRadius * 0.6, 2);

    graphics.generateTexture('coin', coinRadius * 2 + 2, coinRadius * 2 + 2);
    graphics.destroy();

    // Dragon Ball
    graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    const dbRadius = 14;

    // Orange Glass Body
    graphics.fillStyle(0xffa502); // Orange
    graphics.fillCircle(dbRadius, dbRadius, dbRadius);
    
    // Inner Glow
    graphics.fillStyle(0xffb84d);
    graphics.fillCircle(dbRadius, dbRadius, dbRadius * 0.8);

    // Red Stars (Draw 3 stars for generic look)
    graphics.fillStyle(0xe74c3c); // Red
    drawStar(graphics, dbRadius, dbRadius * 0.7, 5, 3, 1.5); // Top
    drawStar(graphics, dbRadius * 0.6, dbRadius * 1.2, 5, 3, 1.5); // Bottom Left
    drawStar(graphics, dbRadius * 1.4, dbRadius * 1.2, 5, 3, 1.5); // Bottom Right
    
    // Shine/Reflection
    graphics.fillStyle(0xffffff, 0.8);
    graphics.fillEllipse(dbRadius * 0.6, dbRadius * 0.6, 6, 4, Math.PI / 4);

    graphics.generateTexture('dragonball', dbRadius * 2, dbRadius * 2);
    graphics.destroy();
    
    // Shield Aura
    graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    const shieldRadius = 40;
    
    // Cyan Aura Ring
    graphics.lineStyle(4, 0x00d2d3, 0.8);
    graphics.strokeCircle(shieldRadius, shieldRadius, shieldRadius - 2);
    
    // Inner Glow (Gradient simulated)
    graphics.fillStyle(0x00d2d3, 0.2);
    graphics.fillCircle(shieldRadius, shieldRadius, shieldRadius);
    
    // Rotating particles (static here, rotated in game)
    graphics.fillStyle(0xffffff, 0.9);
    graphics.fillCircle(shieldRadius, 5, 3);
    graphics.fillCircle(shieldRadius, shieldRadius * 2 - 5, 3);
    graphics.fillCircle(5, shieldRadius, 3);
    graphics.fillCircle(shieldRadius * 2 - 5, shieldRadius, 3);

    graphics.generateTexture('shield', shieldRadius * 2, shieldRadius * 2);
    graphics.destroy();
    
    // Fate Card (Question Mark)
    graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    const cardWidth = 24;
    const cardHeight = 32;
    
    // Card Body (Back)
    graphics.fillStyle(0x2c3e50);
    graphics.fillRoundedRect(0, 0, cardWidth, cardHeight, 4);
    
    // Border
    graphics.lineStyle(2, 0xf1c40f);
    graphics.strokeRoundedRect(0, 0, cardWidth, cardHeight, 4);
    
    // Question Mark
    graphics.fillStyle(0xf1c40f);
    // Draw simplified question mark
    graphics.fillCircle(cardWidth/2, cardHeight*0.35, 6); // Top circle
    graphics.fillStyle(0x2c3e50);
    graphics.fillCircle(cardWidth/2, cardHeight*0.35, 3); // Hole
    graphics.fillStyle(0xf1c40f);
    graphics.fillRect(cardWidth/2 - 2, cardHeight*0.35, 4, cardHeight*0.3); // Stem
    graphics.fillCircle(cardWidth/2, cardHeight*0.8, 2.5); // Dot
    
    graphics.generateTexture('fate-card', cardWidth, cardHeight);
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
