/**
 * Input.js - Handle keyboard and touch input
 */

export default class Input {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = {
            left: false,
            right: false
        };

        this.setupKeyboardListeners();
        this.setupTouchListeners();
    }

    setupKeyboardListeners() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                this.keys.left = true;
            }
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                this.keys.right = true;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                this.keys.left = false;
            }
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                this.keys.right = false;
            }
        });
    }

    setupTouchListeners() {
        const handleTouch = (e, isPressed) => {
            e.preventDefault();
            
            // Reset both keys first
            if (!isPressed) {
                this.keys.left = false;
                this.keys.right = false;
                return;
            }

            // Check all active touches
            for (let i = 0; i < e.touches.length; i++) {
                const touch = e.touches[i];
                const rect = this.canvas.getBoundingClientRect();
                const touchX = touch.clientX - rect.left;
                const midX = this.canvas.width / 2;

                if (touchX < midX) {
                    this.keys.left = true;
                } else {
                    this.keys.right = true;
                }
            }
        };

        this.canvas.addEventListener('touchstart', (e) => handleTouch(e, true), { passive: false });
        this.canvas.addEventListener('touchend', (e) => handleTouch(e, false), { passive: false });
        this.canvas.addEventListener('touchcancel', (e) => handleTouch(e, false), { passive: false });
    }

    isLeft() {
        return this.keys.left;
    }

    isRight() {
        return this.keys.right;
    }
}
