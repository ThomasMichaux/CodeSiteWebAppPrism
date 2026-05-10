'use strict';

const Layout = {
    init() {
        this.sidebar = Utils.$('#sidebar');
        this.chatView = Utils.$('#chatView');
        this.welcomeScreen = Utils.$('#welcomeScreen');
        this.backBtn = Utils.$('#backBtn');
        this.chatList = Utils.$('#chatList');
        this.menuBtn = Utils.$('#menuBtn');

        this.handleResize();
        this.bindEvents();
    },

    bindEvents() {
        window.addEventListener('resize', Utils.debounce(() => {
            this.handleResize();
        }, 150), { passive: true });

        if (this.backBtn) {
            this.backBtn.addEventListener('click', () => {
                if (!Utils.isMobile()) return;
                this.showSidebar();
                this.hideChatView();
            });
        }

        if (this.menuBtn) {
            this.menuBtn.addEventListener('click', () => {
                // Settings - to be implemented
            });
        }

        document.addEventListener('click', (e) => {
            if (Utils.isMobile() &&
                this.sidebar &&
                !this.sidebar.contains(e.target) &&
                !this.sidebar.classList.contains('hidden-mobile') &&
                this.chatView &&
                !this.chatView.classList.contains('hidden')) {
                this.hideSidebar();
            }
        }, { passive: true });
    },

    handleResize() {
        if (Utils.isMobile()) {
            this.mobileLayout();
        } else if (Utils.isTablet()) {
            this.tabletLayout();
        } else {
            this.desktopLayout();
        }
    },

    mobileLayout() {
        if (this.sidebar && this.chatView) {
            const hasActiveChat = this.chatView.classList.contains('hidden') === false;

            if (hasActiveChat) {
                this.hideSidebar();
                this.showChatView();
            } else {
                this.showSidebar();
                this.hideChatView();
            }
        }
    },

    tabletLayout() {
        if (this.sidebar && this.chatView) {
            this.sidebar.classList.remove('hidden-mobile');
            this.showChatView();
        }
    },

    desktopLayout() {
        if (this.sidebar && this.chatView) {
            this.sidebar.classList.remove('hidden-mobile');
            this.showChatView();
        }
    },

    showSidebar() {
        if (this.sidebar) {
            this.sidebar.classList.remove('hidden-mobile');
        }
    },

    hideSidebar() {
        if (this.sidebar && Utils.isMobile()) {
            this.sidebar.classList.add('hidden-mobile');
        }
    },

    showChatView() {
        if (this.chatView && this.welcomeScreen) {
            this.welcomeScreen.classList.add('hidden');
            this.chatView.classList.remove('hidden');
        }
    },

    hideChatView() {
        if (this.chatView && this.welcomeScreen) {
            this.chatView.classList.add('hidden');
            this.welcomeScreen.classList.remove('hidden');
        }
    },

};