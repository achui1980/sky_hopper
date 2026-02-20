/**
 * LanguageManager.js - Manages internationalization (i18n)
 */
import { translations } from '../i18n.js';

export default class LanguageManager {
    constructor() {
        // Default to Chinese or saved preference
        this.currentLang = localStorage.getItem('sky_hopper_lang') || 'zh';
        
        // Check browser language if no preference saved
        if (!localStorage.getItem('sky_hopper_lang')) {
            const browserLang = navigator.language || navigator.userLanguage;
            if (browserLang.startsWith('en')) {
                this.currentLang = 'en';
            }
        }
        
        this.translations = translations;
    }

    /**
     * Set the current language and update UI
     * @param {string} lang - 'en' or 'zh'
     */
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('sky_hopper_lang', lang);
            this.updateDOM();
            
            // Dispatch event for game scenes to update if needed
            window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
            
            return true;
        }
        return false;
    }

    /**
     * Get translated text by key
     * @param {string} key - The translation key (e.g., 'start_game')
     * @param {Array} args - Optional arguments for string formatting
     * @returns {string} Translated text
     */
    getText(key, ...args) {
        const langData = this.translations[this.currentLang];
        let text = langData[key] || key;
        
        // Simple string formatting for {0}, {1}, etc.
        if (args.length > 0) {
            args.forEach((arg, index) => {
                text = text.replace(`{${index}}`, arg);
            });
        }
        
        return text;
    }

    /**
     * Toggle between English and Chinese
     */
    toggleLanguage() {
        const newLang = this.currentLang === 'en' ? 'zh' : 'en';
        this.setLanguage(newLang);
        return newLang;
    }

    /**
     * Update all DOM elements with data-i18n attribute
     */
    updateDOM() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (key) {
                // Check if element has child nodes that should be preserved (like icons)
                // For simplicity, we just replace text content for now
                // Or if it's an input/button with value/textContent
                el.textContent = this.getText(key);
            }
        });
        
        // Update language button text if it exists
        const langBtn = document.getElementById('lang-btn');
        if (langBtn) {
            langBtn.textContent = this.currentLang === 'en' ? 'EN' : '中';
        }
    }
}
