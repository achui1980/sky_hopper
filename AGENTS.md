# Agent Operational Guide: Sky Hopper (Starbound Aviator)

Guidelines for AI agents working on the Starbound Aviator (Sky Hopper) game.
Demo: https://traeskyhopper5ln9.vercel.app/

## Project Overview

**Type:** Vertical Scrolling Infinite Jumper Arcade Game  
**Tech Stack:** Phaser 3 (v3.70.0 CDN), Vanilla JavaScript ES6+ Modules, HTML5 Canvas  
**Architecture:** Scene-based (BootScene, PlayScene), Phaser Arcade Physics, Object Pooling

## Build, Run & Test Commands

### Running the Project
```bash
# Start local server (required for ES modules)
npx serve .                    # Recommended
python3 -m http.server 8080    # Alternative
php -S localhost:8080          # Alternative

# Access at http://localhost:8080
```

### Testing
**Manual testing only** (no automated test framework configured). Start server and test:
1. Basic Controls (Arrow Keys / A-D / Touch)
2. Physics (collision, bouncing, gravity)
3. Score System (points, high score persistence)
4. Biome Transitions (2000+ stratosphere, 5000+ space)
5. Collectibles (coins, rockets, dragon balls)
6. Performance (60 FPS desktop, 30+ FPS mobile)
7. Visual (no ghosting, proper rendering)
8. Audio (sound effects, background music)

### Linting & Deployment
- **No linter configured.** Follow code style guidelines below.
- **Deployment:** `vercel deploy` (Vercel configured), `vercel dev` for local testing.

## Code Style & Conventions

### Formatting
- **Indentation:** 4 spaces
- **Quotes:** Single `'` for strings, backticks `` ` `` for templates
- **Semicolons:** Always required
- **Braces:** K&R style (opening brace on same line)

### Naming Conventions
- **Files:** PascalCase for classes (`Plane.js`), camelCase for entry (`main.js`)
- **Classes:** PascalCase (`Plane`, `CloudManager`, `PlayScene`)
- **Methods/Variables:** camelCase (`update`, `spawnCloud`, `maxHeight`)
- **Constants:** UPPER_CASE or PascalCase objects (`BIOME_THRESHOLDS`, `CloudType`)
- **DOM IDs:** kebab-case (`game-container`, `start-screen`)

### Module System & Imports
**CRITICAL:** Always include `.js` extension in imports (required for browser ES modules)

```javascript
// ✅ CORRECT
import Plane from './sprites/Plane.js';
import { Biome, BIOME_THRESHOLDS } from '../scenes/PlayScene.js';

// ❌ WRONG - Will fail in browser
import Plane from './sprites/Plane';
```

**Import Order:** Phaser classes → Local sprite classes → Manager classes → Constants/enums

### Types & Type Checking
**No TypeScript** - Pure JavaScript ES6+ with JSDoc comments for documentation:

```javascript
/**
 * @param {Phaser.Scene} scene - The scene this sprite belongs to
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 */
constructor(scene, x, y) {
    // Implementation
}
```

**Type Patterns:** Use `@type` for complex objects, `@enum` for constants, `@returns` for functions. No runtime type checking needed.

### Error Handling
- `console.error()` for critical failures
- `console.warn()` for non-blocking issues
- `console.log()` sparingly (remove debug logs before commit)

## Phaser-Specific Patterns (CRITICAL!)

### Sprite Initialization Order
```javascript
// ✅ CORRECT - Add to scene FIRST, then init physics
const sprite = new MySprite(scene, x, y);
scene.add.existing(sprite);
sprite.initPhysics();

// ❌ WRONG - Physics in constructor fails
constructor() {
    super(scene, x, y, texture);
    scene.physics.add.existing(this); // Too early!
}
```

### Position Manipulation
**Always use setter methods to sync physics body:**

```javascript
// ✅ CORRECT - Syncs physics body
sprite.setX(newX);
sprite.setY(newY);
sprite.setPosition(newX, newY);

// ❌ WRONG - Causes ghosting/duplication bugs
sprite.x = newX;
sprite.y = newY;
```

**Exception:** Reading properties is fine (`sprite.x`, `sprite.y`)

### Sprite Class Template
```javascript
export default class MySprite extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'texture-key');
        this.scene = scene;
        // Initialize properties (DO NOT init physics here)
    }

    initPhysics() {
        if (!this.body) {
            this.scene.physics.add.existing(this);
        }
        this.body.setCollideWorldBounds(false);
        this.body.setGravityY(400);
    }

    update(delta) { /* Frame update logic */ }
    reset(x, y) { /* Reset for object pooling */ }
}
```

### Object Pooling
```javascript
this.clouds = scene.physics.add.group({
    classType: Cloud,
    maxSize: 30,
    runChildUpdate: false  // Manual control required
});

// Manually update active sprites
this.clouds.children.entries.forEach(cloud => {
    if (cloud.active) cloud.update(delta);
});
```

## File Structure

```
js/
├── main.js                   # Phaser config & initialization
├── TextureGenerator.js       # Programmatic texture generation
├── scenes/
│   ├── BootScene.js         # Texture generation
│   └── PlayScene.js         # Main game logic
├── sprites/
│   ├── Plane.js             # Player sprite
│   ├── Cloud.js             # Platform sprite (with visual types)
│   └── Collectible.js       # Coin/rocket items
└── managers/
    └── CloudManager.js      # Spawning & pooling logic
```

## Common Pitfalls & Solutions

1. **Ghosting/duplication:** Direct property assignment (`sprite.x = val`) instead of `setX()`
2. **Physics not working:** Initializing physics before `scene.add.existing()`
3. **Double updates:** Using `runChildUpdate: true` in Group config
4. **Collision issues:** Not checking `plane.body.velocity.y > 0` for one-way platforms
5. **Texture problems:** Missing deadly variants for meteors/satellites (use `-deadly` suffix)

## Performance & Workflow

- **Object Pooling:** Always use Phaser Groups for reusable sprites
- **No Allocations:** Never create objects in `update()` loops
- **Target:** 60 FPS desktop, 30+ FPS mobile, <100 active sprites
- **Workflow:** Start server → Edit JS → Hard refresh → Test → Verify no artifacts

## Important Constraints

- **No Build Tools:** No Webpack, Vite, Babel, TypeScript
- **CDN Only:** Phaser via CDN, no npm packages
- **ES Modules:** Must include `.js` extensions
- **No External Assets:** All textures generated programmatically

---

**References:** `PHASER_README.md`, `FIXES_COMPLETED.md`, `TEST_REPORT.md`