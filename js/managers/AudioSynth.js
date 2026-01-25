/**
 * AudioSynth.js - Programmatic 8-bit sound effects generator
 * Uses Web Audio API to generate retro-style game sounds
 */

export default class AudioSynth {
    constructor(scene) {
        this.scene = scene;
        this.context = null;
        this.enabled = true;
        this.rocketOscillator = null;
        this.rocketGain = null;
        
        // Initialize audio context
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            // Get Phaser's audio context or create new one
            if (this.scene.sound && this.scene.sound.context) {
                this.context = this.scene.sound.context;
            } else {
                this.context = new (window.AudioContext || window.webkitAudioContext)();
            }
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
            this.enabled = false;
        }
    }

    /**
     * Resume audio context (required after user interaction)
     */
    resume() {
        if (this.context && this.context.state === 'suspended') {
            this.context.resume();
        }
    }

    /**
     * Play a basic tone
     * @param {number} frequency - Base frequency in Hz
     * @param {number} duration - Duration in seconds
     * @param {string} type - Oscillator type: 'sine', 'square', 'sawtooth', 'triangle'
     * @param {number} volume - Volume 0.0 to 1.0
     * @param {number} frequencyEnd - End frequency for pitch slide (optional)
     */
    playTone(frequency, duration, type = 'square', volume = 0.3, frequencyEnd = null) {
        if (!this.enabled || !this.context) return;

        try {
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();
            const now = this.context.currentTime;

            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, now);
            
            // Pitch slide if end frequency specified
            if (frequencyEnd !== null) {
                oscillator.frequency.exponentialRampToValueAtTime(
                    Math.max(frequencyEnd, 1), 
                    now + duration
                );
            }

            // Volume envelope: quick attack, sustain, quick release
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
            gainNode.gain.setValueAtTime(volume, now + duration * 0.7);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

            oscillator.connect(gainNode);
            gainNode.connect(this.context.destination);

            oscillator.start(now);
            oscillator.stop(now + duration);
        } catch (e) {
            console.warn('Error playing tone:', e);
        }
    }

    /**
     * Bounce sound - short low-pitched "boing"
     */
    playBounce() {
        if (!this.enabled) return;
        this.resume();
        
        // Main bounce tone (low pitch going lower)
        this.playTone(200, 0.12, 'square', 0.25, 80);
        
        // Subtle harmonic
        setTimeout(() => {
            this.playTone(150, 0.08, 'sine', 0.1, 60);
        }, 20);
    }

    /**
     * Coin collect sound - cheerful two-note chime
     */
    playCoin() {
        if (!this.enabled) return;
        this.resume();
        
        // First note
        this.playTone(880, 0.08, 'square', 0.2);
        
        // Second note (higher)
        setTimeout(() => {
            this.playTone(1320, 0.12, 'square', 0.2);
        }, 80);
    }

    /**
     * Rocket boost start - ascending whoosh with sustained engine sound
     */
    playRocket() {
        if (!this.enabled || !this.context) return;
        if (this.rocketOscillator) return; // Already playing
        this.resume();

        try {
            const now = this.context.currentTime;

            // Initial whoosh (ascending pitch)
            this.playTone(100, 0.3, 'sawtooth', 0.15, 400);

            // Sustained engine sound
            this.rocketOscillator = this.context.createOscillator();
            this.rocketGain = this.context.createGain();
            
            // Create slight modulation for engine rumble
            const lfo = this.context.createOscillator();
            const lfoGain = this.context.createGain();
            
            lfo.frequency.value = 8; // Vibrato speed
            lfoGain.gain.value = 15; // Vibrato depth
            
            lfo.connect(lfoGain);
            lfoGain.connect(this.rocketOscillator.frequency);

            this.rocketOscillator.type = 'sawtooth';
            this.rocketOscillator.frequency.setValueAtTime(80, now);
            
            this.rocketGain.gain.setValueAtTime(0, now);
            this.rocketGain.gain.linearRampToValueAtTime(0.12, now + 0.3);

            this.rocketOscillator.connect(this.rocketGain);
            this.rocketGain.connect(this.context.destination);

            lfo.start(now);
            this.rocketOscillator.start(now + 0.2);
            
            // Store LFO for cleanup
            this.rocketLfo = lfo;
        } catch (e) {
            console.warn('Error playing rocket sound:', e);
        }
    }

    /**
     * Stop rocket boost sound
     */
    stopRocket() {
        if (!this.enabled || !this.context) return;

        try {
            const now = this.context.currentTime;

            if (this.rocketGain) {
                // Fade out
                this.rocketGain.gain.linearRampToValueAtTime(0, now + 0.2);
            }

            // Descending pitch for engine shutdown
            this.playTone(200, 0.3, 'sawtooth', 0.1, 50);

            // Cleanup after fade
            setTimeout(() => {
                if (this.rocketOscillator) {
                    try {
                        this.rocketOscillator.stop();
                    } catch (e) {}
                    this.rocketOscillator = null;
                }
                if (this.rocketLfo) {
                    try {
                        this.rocketLfo.stop();
                    } catch (e) {}
                    this.rocketLfo = null;
                }
                this.rocketGain = null;
            }, 300);
        } catch (e) {
            console.warn('Error stopping rocket sound:', e);
        }
    }

    /**
     * Game over sound - descending sad melody
     */
    playGameOver() {
        if (!this.enabled) return;
        this.resume();
        
        // Stop any rocket sound
        this.stopRocket();

        // Three descending notes
        this.playTone(400, 0.2, 'square', 0.25);
        
        setTimeout(() => {
            this.playTone(300, 0.2, 'square', 0.25);
        }, 200);
        
        setTimeout(() => {
            this.playTone(200, 0.4, 'square', 0.25, 100);
        }, 400);
    }

    /**
     * Thunder/death sound - harsh buzz
     */
    playThunder() {
        if (!this.enabled) return;
        this.resume();

        // Quick harsh buzz
        this.playTone(80, 0.15, 'sawtooth', 0.3);
        this.playTone(120, 0.15, 'square', 0.2);
    }

    /**
     * Dragon Ball Collect - Mystical chime
     */
    playDragonBallCollect() {
        if (!this.enabled) return;
        this.resume();
        
        // Fast arpeggio
        this.playTone(660, 0.1, 'sine', 0.2);
        setTimeout(() => this.playTone(880, 0.1, 'sine', 0.2), 60);
        setTimeout(() => this.playTone(1100, 0.15, 'sine', 0.2), 120);
    }

    /**
     * Shield Activate - Power up sound
     */
    playShieldActivate() {
        if (!this.enabled) return;
        this.resume();
        
        // Rising power sound
        this.playTone(300, 0.5, 'sine', 0.3, 800);
        this.playTone(305, 0.5, 'triangle', 0.2, 805);
    }

    /**
     * Shield Break/Revive - Shatter and bounce
     */
    playShieldBreak() {
        if (!this.enabled) return;
        this.resume();
        
        // Shatter (High pitch noise-like)
        this.playTone(1200, 0.1, 'sawtooth', 0.3, 600);
        
        // Bounce sound (Heavy)
        setTimeout(() => {
            this.playTone(150, 0.3, 'square', 0.4, 60);
        }, 50);
    }

    /**
     * Toggle sound on/off
     */
    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.stopRocket();
        }
        return this.enabled;
    }

    /**
     * Set master volume (future enhancement)
     */
    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
}
