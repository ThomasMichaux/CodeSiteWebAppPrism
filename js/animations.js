'use strict';

const Animations = {
    messageIn(element) {
        if (!element) return;
        element.style.transform = 'translateY(10px)';
        element.style.opacity = '0';
        element.style.transition = 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1), opacity 250ms cubic-bezier(0.4, 0, 0.2, 1)';

        requestAnimationFrame(() => {
            element.style.transform = 'translateY(0)';
            element.style.opacity = '1';
        });
    },

    slideInUp(element, duration = 250) {
        if (!element) return;
        element.style.transform = 'translateY(20px)';
        element.style.opacity = '0';
        element.style.transition = `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;

        requestAnimationFrame(() => {
            element.style.transform = 'translateY(0)';
            element.style.opacity = '1';
        });
    },

    showModal(modal) {
        if (!modal) return;
        modal.classList.remove('hidden');
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            this.slideInUp(modalContent);
        }
    },

    hideModal(modal) {
        if (!modal) return;
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            this.slideOutDown(modalContent);
            const handler = () => {
                modalContent.removeEventListener('transitionend', handler);
                modal.classList.add('hidden');
            };
            modalContent.addEventListener('transitionend', handler, { once: true });
        } else {
            modal.classList.add('hidden');
        }
    },

    slideOutDown(element, duration = 250) {
        if (!element) return;
        element.style.transition = `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        element.style.transform = 'translateY(20px)';
        element.style.opacity = '0';
    },

    typingIndicator(container) {
        const existing = container.querySelector('.typing-indicator');
        if (existing) return existing;

        const indicator = Utils.createElement('div', {
            className: 'typing-indicator'
        }, [
            Utils.createElement('span'),
            Utils.createElement('span'),
            Utils.createElement('span')
        ]);

        container.appendChild(indicator);
        Utils.scrollToBottom(container.closest('.messages-container'));
        return indicator;
    },

    removeTypingIndicator(container) {
        const indicator = container.querySelector('.typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }
};