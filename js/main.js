'use strict';

const App = {
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    },

    start() {
        Layout.init();
        Components.init();

        this.initTheme();
        this.checkAccessibility();
    },

    initTheme() {
        const stored = localStorage.getItem('prism-theme');
        if (stored === 'light' || stored === 'dark') {
            document.documentElement.dataset.theme = stored;
        }
    },

    checkAccessibility() {
        if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;

        const focusableElements = document.querySelectorAll(
            'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
        );

        focusableElements.forEach(el => {
            if (!el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby') && !el.textContent.trim()) {
                console.warn('[a11y] Element missing accessible label:', el);
            }
        });
    }
};

App.init();