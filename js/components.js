'use strict';

const Components = {
    init() {
        this.chatList = Utils.$('#chatList');
        this.messagesContainer = Utils.$('#messages');
        this.chatAvatar = Utils.$('#chatAvatar');
        this.chatName = Utils.$('#chatName');
        this.chatStatus = Utils.$('#chatStatus');
        this.messageInput = Utils.$('#messageInput');
        this.sendBtn = Utils.$('#sendBtn');
        this.newChatBtn = Utils.$('#newChatBtn');
        this.searchInput = Utils.$('#searchInput');
        this._replyTimers = [];

        this.activeChat = null;
        this.chats = this.loadChats();

        this.renderChatList();
        this.bindEvents();
    },

    bindEvents() {
        if (this.sendBtn) {
            this.sendBtn.addEventListener('click', () => {
                this.sendMessage();
            });
        }

        if (this.messageInput) {
            this.messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            this.messageInput.addEventListener('input', () => {
                this.autoResizeTextarea();
            });
        }

        if (this.newChatBtn) {
            this.newChatBtn.addEventListener('click', () => {
                this.showNewChatModal();
            });
        }

        if (this.searchInput) {
            this.searchInput.addEventListener('input', Utils.debounce(() => {
                this.filterChats(this.searchInput.value);
            }, 300));
        }

        this.bindChatListKeyboardNav();
    },

    bindChatListKeyboardNav() {
        const list = this.chatList;
        if (!list) return;

        list.addEventListener('keydown', (e) => {
            const items = [...list.querySelectorAll('.chat-item:not([hidden])')];
            if (items.length === 0) return;

            const idx = items.indexOf(document.activeElement);
            if (idx === -1) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    items[Math.min(idx + 1, items.length - 1)]?.focus();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    items[Math.max(idx - 1, 0)]?.focus();
                    break;
                case 'Home':
                    e.preventDefault();
                    items[0]?.focus();
                    break;
                case 'End':
                    e.preventDefault();
                    items[items.length - 1]?.focus();
                    break;
            }
        });
    },

    loadChats() {
        try {
            const saved = localStorage.getItem('prism_chats');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to parse saved chats:', e);
            try {
                localStorage.setItem('prism_chats_corrupted_' + Date.now(), saved);
            } catch { }
            localStorage.removeItem('prism_chats');
        }

        return [
            {
                id: '1',
                name: 'Alice Johnson',
                initials: 'AJ',
                online: true,
                lastMessage: 'Hey! How are you doing?',
                timestamp: Date.now() - 300000,
                unread: 2,
                messages: [
                    { id: '1', text: 'Hey! How are you doing?', sender: 'other', timestamp: Date.now() - 300000 }
                ]
            },
            {
                id: '2',
                name: 'Bob Smith',
                initials: 'BS',
                online: false,
                lastMessage: 'The meeting is at 3pm tomorrow',
                timestamp: Date.now() - 3600000,
                unread: 0,
                messages: [
                    { id: '2', text: 'The meeting is at 3pm tomorrow', sender: 'other', timestamp: Date.now() - 3600000 }
                ]
            },
            {
                id: '3',
                name: 'Team Chat',
                initials: 'TC',
                online: true,
                lastMessage: 'Sarah: Updated the design files',
                timestamp: Date.now() - 7200000,
                unread: 5,
                messages: [
                    { id: '3', text: 'Sarah: Updated the design files', sender: 'other', timestamp: Date.now() - 7200000 }
                ]
            },
            {
                id: '4',
                name: 'Charlie Brown',
                initials: 'CB',
                online: true,
                lastMessage: 'Thanks for the help!',
                timestamp: Date.now() - 86400000,
                unread: 0,
                messages: [
                    { id: '4', text: 'Thanks for the help!', sender: 'other', timestamp: Date.now() - 86400000 }
                ]
            }
        ];
    },

    saveChats() {
        try {
            localStorage.setItem('prism_chats', JSON.stringify(this.chats));
        } catch (e) {
            console.error('Failed to save chats:', e);
        }
    },

    renderChatList(filter = '') {
        if (!this.chatList) return;

        const section = this.chatList.querySelector('.chat-list-section');

        if (filter) {
            const normalized = filter.toLowerCase().trim();
            document.querySelectorAll('.chat-item').forEach(item => {
                const id = item.dataset.chatId;
                const chat = this.chats.find(c => c.id === id);
                if (!chat) return;
                const matches = chat.name.toLowerCase().includes(normalized) ||
                    chat.lastMessage.toLowerCase().includes(normalized);
                item.hidden = !matches;
            });
            this._updateSectionTitle(section, filter);
            return;
        }

        const existingItems = this.chatList.querySelectorAll('.chat-item');
        existingItems.forEach(item => item.remove());

        this.chats.forEach((chat, index) => {
            const chatItem = this.createChatItem(chat);
            chatItem.style.animationDelay = `${index * 50}ms`;
            section.appendChild(chatItem);
        });
    },

    _updateSectionTitle(section) {
        const title = section.querySelector('.section-title');
        if (title) {
            title.textContent = 'Recent';
        }
    },

    createChatItem(chat) {
        const item = Utils.createElement('div', {
            className: 'chat-item',
            'data-chat-id': chat.id,
            tabindex: '0',
            role: 'button'
        });

        const avatar = Utils.createElement('div', {
            className: 'avatar small',
            textContent: chat.initials
        });

        const content = Utils.createElement('div', {
            className: 'chat-item-content'
        });

        const header = Utils.createElement('div', {
            className: 'chat-item-header'
        });

        const name = Utils.createElement('span', {
            className: 'chat-item-name',
            textContent: chat.name
        });

        const time = Utils.createElement('span', {
            className: 'chat-item-time',
            textContent: Utils.formatTime(chat.timestamp)
        });

        header.appendChild(name);
        header.appendChild(time);

        const preview = Utils.createElement('p', {
            className: 'chat-item-preview',
            textContent: chat.lastMessage
        });

        content.appendChild(header);
        content.appendChild(preview);

        item.appendChild(avatar);
        item.appendChild(content);

        if (chat.unread > 0) {
            const badge = Utils.createElement('span', {
                className: 'chat-item-badge',
                textContent: chat.unread
            });
            item.appendChild(badge);
        }

        item.addEventListener('click', () => {
            this.openChat(chat.id);
        });

        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.openChat(chat.id);
            }
        });

        return item;
    },

    openChat(chatId) {
        this._replyTimers.forEach(clearTimeout);
        this._replyTimers = [];

        const chat = this.chats.find(c => c.id === chatId);
        if (!chat) return;

        this.activeChat = chat;

        document.querySelectorAll('.chat-item').forEach(el => {
            el.classList.toggle('active', el.dataset.chatId === chatId);
        });

        if (this.chatAvatar) {
            this.chatAvatar.textContent = chat.initials;
        }

        if (this.chatName) {
            this.chatName.textContent = chat.name;
        }

        if (this.chatStatus) {
            this.chatStatus.textContent = chat.online ? 'Online' : 'Offline';
            this.chatStatus.className = `status ${chat.online ? 'online' : ''}`;
        }

        this.renderMessages();
        Layout.showChatView();

        if (Utils.isMobile()) {
            Layout.hideSidebar();
        }

        chat.unread = 0;
        this.renderChatList(this.searchInput ? this.searchInput.value : '');
        this.saveChats();
    },

    renderMessages() {
        if (!this.messagesContainer || !this.activeChat) return;

        this.messagesContainer.innerHTML = '';

        const fragment = document.createDocumentFragment();
        this.activeChat.messages.forEach((message) => {
            const messageEl = this.createMessageElement(message);
            fragment.appendChild(messageEl);
        });

        this.messagesContainer.appendChild(fragment);
        Utils.scrollToBottom(Utils.$('#messagesContainer'));
    },

    createMessageElement(message) {
        const isOutgoing = message.sender === 'me';
        const messageEl = Utils.createElement('div', {
            className: `message ${isOutgoing ? 'outgoing' : 'incoming'}`
        });

        const bubble = Utils.createElement('div', {
            className: 'message-bubble',
            textContent: message.text
        });

        const timeContainer = Utils.createElement('div', {
            className: 'message-time'
        });

        const time = Utils.createElement('span', {
            textContent: Utils.formatMessageTime(message.timestamp)
        });

        timeContainer.appendChild(time);

        if (isOutgoing) {
            const status = Utils.createElement('span', {
                className: 'message-status sent'
            });

            const check = Utils.createElement('svg', {
                width: '14',
                height: '14',
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: 'currentColor',
                'stroke-width': '2'
            });

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', 'M20 6L9 17l-5-5');
            check.appendChild(path);

            status.appendChild(check);
            timeContainer.appendChild(status);
        }

        messageEl.appendChild(bubble);
        messageEl.appendChild(timeContainer);

        Animations.messageIn(messageEl);

        return messageEl;
    },

    sendMessage() {
        if (!this.messageInput || !this.activeChat) return;

        const text = this.messageInput.value.trim();
        if (!text) return;

        const message = {
            id: Utils.generateId(),
            text: text,
            sender: 'me',
            timestamp: Date.now()
        };

        this.activeChat.messages.push(message);
        this.activeChat.lastMessage = text;
        this.activeChat.timestamp = Date.now();

        const messageEl = this.createMessageElement(message);
        this.messagesContainer.appendChild(messageEl);

        this.messageInput.value = '';
        this.autoResizeTextarea();

        Utils.scrollToBottom(Utils.$('#messagesContainer'));

        this.saveChats();
        this.renderChatList(this.searchInput ? this.searchInput.value : '');

        this.simulateReply();
    },

    simulateReply() {
        if (!this.activeChat) return;

        const chatId = this.activeChat.id;
        const typingContainer = Utils.$('#messagesContainer');
        Animations.typingIndicator(typingContainer);

        const timer = setTimeout(() => {
            if (!this.activeChat || this.activeChat.id !== chatId) return;

            Animations.removeTypingIndicator(typingContainer);

            const replies = [
                'That sounds great!',
                'I\'ll get back to you on that.',
                'Thanks for letting me know!',
                'Got it, thanks!',
                'Sure, no problem.',
                'Let me check and get back to you.',
                'That works for me!'
            ];

            const reply = {
                id: Utils.generateId(),
                text: replies[Math.floor(Math.random() * replies.length)],
                sender: 'other',
                timestamp: Date.now()
            };

            this.activeChat.messages.push(reply);
            this.activeChat.lastMessage = reply.text;
            this.activeChat.timestamp = Date.now();

            const replyEl = this.createMessageElement(reply);
            this.messagesContainer.appendChild(replyEl);

            Utils.scrollToBottom(typingContainer);
            this.saveChats();
            this.renderChatList(this.searchInput ? this.searchInput.value : '');
        }, 1500 + Math.random() * 1500);

        this._replyTimers.push(timer);
    },

    autoResizeTextarea() {
        if (!this.messageInput) return;

        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    },

    filterChats(query) {
        if (this.chatList) {
            this.renderChatList(query);
        }
    },

    showNewChatModal() {
        const existingModal = Utils.$('#newChatModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = Utils.createElement('div', {
            id: 'newChatModal',
            className: 'new-chat-modal',
            role: 'dialog',
            'aria-modal': 'true',
            'aria-labelledby': 'modalTitle'
        });

        const modalContent = Utils.createElement('div', {
            className: 'modal-content'
        });

        const header = Utils.createElement('div', {
            className: 'modal-header'
        });

        const title = Utils.createElement('h2', {
            className: 'modal-title',
            id: 'modalTitle',
            textContent: 'New Chat'
        });

        const closeBtn = Utils.createElement('button', {
            className: 'icon-btn modal-close',
            'aria-label': 'Close modal'
        });

        const closeSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        closeSvg.setAttribute('width', '20');
        closeSvg.setAttribute('height', '20');
        closeSvg.setAttribute('viewBox', '0 0 24 24');
        closeSvg.setAttribute('fill', 'none');
        closeSvg.setAttribute('stroke', 'currentColor');
        closeSvg.setAttribute('stroke-width', '2');

        const closePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        closePath.setAttribute('d', 'M18 6L6 18M6 6l12 12');
        closeSvg.appendChild(closePath);
        closeBtn.appendChild(closeSvg);

        header.appendChild(title);
        header.appendChild(closeBtn);

        const body = Utils.createElement('div', {
            className: 'modal-body'
        });

        const input = Utils.createElement('input', {
            className: 'modal-input',
            type: 'text',
            placeholder: 'Enter contact name...',
            id: 'newChatName'
        });

        body.appendChild(input);

        const actions = Utils.createElement('div', {
            className: 'modal-actions'
        });

        const cancelBtn = Utils.createElement('button', {
            className: 'btn btn-secondary',
            textContent: 'Cancel'
        });

        const createBtn = Utils.createElement('button', {
            className: 'btn btn-primary',
            textContent: 'Create'
        });

        actions.appendChild(cancelBtn);
        actions.appendChild(createBtn);

        modalContent.appendChild(header);
        modalContent.appendChild(body);
        modalContent.appendChild(actions);
        modal.appendChild(modalContent);

        document.body.appendChild(modal);

        Animations.showModal(modal);

        const triggerElement = Utils.$('#newChatBtn');

        const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const getFocusable = () => [...modal.querySelectorAll(focusableSelector)].filter(el => !el.disabled);

        const closeModal = () => {
            Animations.hideModal(modal);
            setTimeout(() => {
                modal.remove();
                if (triggerElement) triggerElement.focus();
            }, 300);
        };

        const trapFocus = (e) => {
            const focusable = getFocusable();
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
            trapFocus(e);
        });

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        createBtn.addEventListener('click', () => {
            const name = input.value.trim();
            if (name) {
                this.createNewChat(name);
                closeModal();
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const name = input.value.trim();
                if (name) {
                    this.createNewChat(name);
                    closeModal();
                }
            }
        });

        input.focus();
    },

    createNewChat(name) {
        const newChat = {
            id: Utils.generateId(),
            name: name,
            initials: Utils.getInitials(name),
            online: false,
            lastMessage: 'Start a conversation',
            timestamp: Date.now(),
            unread: 0,
            messages: []
        };

        this.chats.unshift(newChat);
        this.saveChats();
        this.renderChatList(this.searchInput ? this.searchInput.value : '');
        this.openChat(newChat.id);
    }
};