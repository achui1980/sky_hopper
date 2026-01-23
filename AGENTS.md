# Agent Operational Guide: Sky Hopper (Starbound Aviator)

Guidelines for AI agents working on the Starbound Aviator (Sky Hopper) game.

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
**No automated tests.** Manual testing only:
1. Start server and open browser
2. Test movement (Arrow Keys / A/D / Touch)
3. Verify collision, bouncing, score tracking
4. Test biome transitions (2000+ and 5000+ score)
5. Collect items (coins, rockets)
6. Check for visual artifacts and 60 FPS

### Linting
**No linter configured.** Follow code style guidelines below.

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

**Import Order:**
1. Phaser classes (usually via global `Phaser` object)
2. Local sprite classes
3. Manager classes
4. Constants/enums

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

## Performance Guidelines

- **Object Pooling:** Always use Phaser Groups for reusable sprites
- **No Allocations:** Never create objects in `update()` loops
- **Target:** 60 FPS desktop, 30+ FPS mobile, <100 active sprites

## Development Workflow

1. Start server: `npx serve .`
2. Make changes to JS files
3. Hard refresh browser (Cmd+Shift+R / Ctrl+F5)
4. Check console for errors
5. Play test affected features
6. Verify no ghosting/artifacts

## Important Constraints

- **No Build Tools:** No Webpack, Vite, Babel, TypeScript
- **CDN Only:** Phaser via CDN, no npm packages
- **ES Modules:** Must include `.js` extensions
- **No External Assets:** All textures generated programmatically

## Game Mechanics Reference

**Biomes:**
- Sky (0-1999): Blue background, white clouds
- Stratosphere (2000-4999): Purple background, moving platforms
- Space (5000+): Black + stars, meteors/satellites

**Cloud Types:**
- White: Normal platform
- Grey: Disappears after bounce
- Thunder: Instant death (red glow + lightning on meteors/satellites)

**Pseudo-Infinite Scroll:**
- Camera never moves up
- When plane reaches midline going up: lock plane Y, scroll world down, increment score

---

**References:** `PHASER_README.md`, `FIXES_COMPLETED.md`, `TEST_REPORT.md`
