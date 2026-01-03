// ==========================================================================
// MOCK DATA
// ==========================================================================
const CONTACTS = [
    {
        id: 1, name: "Alice Freeman", avatar: "https://picsum.photos/seed/alice/200", time: "10:30 AM", preview: "See you tomorrow!", unread: 2,
        messages: [
            { text: "Hey Alice!", me: false, time: "10:00 AM" },
            { text: "Hi! Are we still on for meeting?", me: false, time: "10:05 AM" },
            { text: "Yes, definitely. I've prepared slides.", me: true, time: "10:15 AM", status: "read" },
            { text: "Great. Should I bring coffee?", me: true, time: "10:20 AM", status: "read" },
            { text: "Please do! See you tomorrow!", me: false, time: "10:30 AM" }
        ]
    },
    {
        id: 2, name: "Bob Smith", avatar: "https://picsum.photos/seed/bob/200", time: "Yesterday", preview: "Can you send file?", unread: 0,
        messages: [
            { text: "Hi Bob, how's project going?", me: true, time: "Yesterday", status: "read" },
            { text: "It's going well. Can you send file?", me: false, time: "Yesterday" }
        ]
    },
    {
        id: 3, name: "Team Prism", avatar: "https://picsum.photos/seed/prism/200", time: "Mon", preview: "Dave: Updated repo.", unread: 5,
        messages: [
            { text: "Welcome to the team channel!", me: false, time: "Mon" }
        ]
    }
];

// ==========================================================================
// STATE MANAGEMENT
// ==========================================================================
const state = {
    activeId: null,
    isMobile: window.innerWidth <= 900
};

// ==========================================================================
// STORAGE (LocalStorage Persistence)
// ==========================================================================
const Storage = {
    save: () => {
        try {
            localStorage.setItem('prism-contacts', JSON.stringify(CONTACTS));
            localStorage.setItem('prism-state', JSON.stringify({
                activeId: state.activeId
            }));
        } catch (e) {
            console.warn('Storage save failed:', e);
        }
    },
    
    load: () => {
        try {
            const contacts = localStorage.getItem('prism-contacts');
            const savedState = localStorage.getItem('prism-state');
            
            if (contacts) {
                const parsed = JSON.parse(contacts);
                CONTACTS.length = 0;
                CONTACTS.push(...parsed);
            }
            
            if (savedState) {
                const parsed = JSON.parse(savedState);
                if (parsed.activeId) {
                    state.activeId = parsed.activeId;
                }
            }
        } catch (e) {
            console.warn('Storage load failed:', e);
        }
    },
    
    clear: () => {
        localStorage.removeItem('prism-contacts');
        localStorage.removeItem('prism-state');
    }
};

// ==========================================================================
// UTILITIES
// ==========================================================================
const getHTML = (str) => { 
    const d = document.createElement('div'); 
    d.textContent = str; 
    return d.innerHTML; 
};

const sanitizeUrl = (url) => {
    try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol) ? url : '';
    } catch {
        return '';
    }
};

const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

// ==========================================================================
// RENDER FUNCTIONS
// ==========================================================================
const renderContacts = () => {
    const list = document.getElementById('contact-list');
    list.innerHTML = CONTACTS.map(c => `
        <div class="contact-item ${state.activeId === c.id ? 'active' : ''}" 
             onclick="App.openChat(${c.id})"
             data-id="${c.id}"
             role="listitem">
            <img src="${sanitizeUrl(c.avatar)}" 
                 class="contact-avatar"
                 alt="${getHTML(c.name)} avatar"
                 loading="lazy"
                 onerror="this.src='https://picsum.photos/seed/fallback/200'">
            <div class="contact-info">
                <div class="contact-top">
                    <span class="contact-name">${getHTML(c.name)}</span>
                    <span class="contact-time">${getHTML(c.time)}</span>
                </div>
                <div class="contact-bottom">
                    <span class="contact-preview">${getHTML(c.preview)}</span>
                    ${c.unread > 0 ? `<span class="unread-badge">${c.unread}</span>` : ''}
                </div>
            </div>
        </div>
    `).join('');
};

const updateSingleContact = (id) => {
    const contact = CONTACTS.find(c => c.id === id);
    const element = document.querySelector(`.contact-item[data-id="${id}"]`);
    if (!element || !contact) return;
    
    element.querySelector('.contact-time').textContent = contact.time;
    element.querySelector('.contact-preview').textContent = contact.preview;
    
    const badgeContainer = element.querySelector('.contact-bottom');
    let badge = badgeContainer.querySelector('.unread-badge');
    
    if (contact.unread > 0) {
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'unread-badge';
            badgeContainer.appendChild(badge);
        }
        badge.textContent = contact.unread;
    } else if (badge) {
        badge.remove();
    }
};

const renderMessages = (id) => {
    const chat = CONTACTS.find(c => c.id === id);
    if(!chat) return;
    
    const html = `
        <div class="date-divider">Today</div>
        ${chat.messages.map(m => `
            <div class="message ${m.me ? 'sent' : 'received'}">
                <div class="message-bubble">
                    ${getHTML(m.text)}
                    <span class="message-time">
                        ${getHTML(m.time)}
                        ${m.me ? `<svg class="icon-tick ${m.status === 'read' ? 'tick-blue' : ''}" viewBox="0 0 16 15" width="16" height="15" aria-hidden="true"><path fill="currentColor" d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/></svg>` : ''}
                    </span>
                </div>
            </div>
        `).join('')}
        <div class="message received" id="typing-indicator" style="display:none;">
            <div class="typing-indicator">
                <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
            </div>
        </div>
    `;
    
    const wrapper = document.getElementById('messages-wrapper');
    wrapper.innerHTML = html;
    wrapper.scrollTop = wrapper.scrollHeight;
};

// ==========================================================================
// APP LOGIC
// ==========================================================================
window.App = {
    init: () => {
        // Hide loader
        setTimeout(() => {
            document.getElementById('loader').classList.add('hidden');
        }, 300);

        // Load saved data
        Storage.load();
        
        // Event Listeners
        document.getElementById('login-form').onsubmit = App.handleLogin;
        document.getElementById('back-btn').onclick = App.handleBack;
        document.getElementById('send-btn').onclick = App.sendMessage;
        document.getElementById('msg-input').onkeypress = (e) => { 
            if(e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                App.sendMessage(); 
            }
        };
        
        // Responsive handling
        const handleResize = debounce(() => {
            state.isMobile = window.innerWidth <= 900;
        }, 250);
        window.addEventListener('resize', handleResize);
        
        // Restore active chat if exists
        if (state.activeId) {
            const contact = CONTACTS.find(c => c.id === state.activeId);
            if (contact) {
                setTimeout(() => {
                    App.openChat(state.activeId);
                }, 500);
            }
        }
    },

    handleLogin: (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        
        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }
        
        btn.innerText = "Verifying...";
        btn.disabled = true;
        
        setTimeout(() => {
            document.getElementById('auth-view').style.display = 'none';
            const app = document.getElementById('main-view');
            app.classList.add('active');
            renderContacts();
            document.getElementById('loader').classList.add('hidden');
        }, 800);
    },

    handleBack: () => {
        document.getElementById('main-view').classList.remove('chat-active');
        state.activeId = null;
        Storage.save();
        renderContacts();
    },

    openChat: (id) => {
        state.activeId = id;
        const contact = CONTACTS.find(c => c.id === id);
        if (!contact) return;
        
        contact.unread = 0;

        document.getElementById('empty-state').style.display = 'none';
        document.getElementById('active-chat').style.display = 'flex';
        
        const avatarEl = document.getElementById('header-avatar');
        avatarEl.src = sanitizeUrl(contact.avatar);
        avatarEl.alt = `${contact.name} avatar`;
        avatarEl.onerror = () => { avatarEl.src = 'https://picsum.photos/seed/fallback/200'; };
        
        document.getElementById('header-name').textContent = contact.name;
        document.getElementById('header-status').textContent = 'online';
        
        if(state.isMobile) {
            document.getElementById('main-view').classList.add('chat-active');
        }

        renderContacts();
        renderMessages(id);
        Storage.save();
        
        // Focus input
        setTimeout(() => {
            document.getElementById('msg-input').focus();
        }, 100);
    },

    sendMessage: () => {
        const input = document.getElementById('msg-input');
        const text = input.value.trim();
        if(!text || !state.activeId) return;
        
        const contact = CONTACTS.find(c => c.id === state.activeId);
        if (!contact) return;
        
        const now = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        contact.messages.push({
            text: text,
            me: true,
            time: now,
            status: 'sent'
        });
        contact.preview = "You: " + text;
        contact.time = "Just now";

        input.value = '';
        renderMessages(state.activeId);
        updateSingleContact(state.activeId);
        Storage.save();

        // Simulate Reply
        setTimeout(() => {
            if(state.activeId === contact.id) {
                const indicator = document.getElementById('typing-indicator');
                if(indicator) {
                    indicator.style.display = 'flex';
                    const wrapper = document.getElementById('messages-wrapper');
                    wrapper.scrollTop = wrapper.scrollHeight;
                }
            }
        }, 600);

        setTimeout(() => {
            const indicator = document.getElementById('typing-indicator');
            if(indicator) indicator.style.display = 'none';

            const replies = [
                "That sounds good!",
                "I agree with you.",
                "Interesting point!",
                "Let me think about that.",
                "Can you elaborate?",
                "Perfect, thanks!"
            ];
            
            const randomReply = replies[Math.floor(Math.random() * replies.length)];

            contact.messages.push({
                text: randomReply,
                me: false,
                time: now
            });
            contact.preview = randomReply;
            contact.time = "Just now";
            
            // Mark previous message as read
            const myMessages = contact.messages.filter(m => m.me);
            if(myMessages.length > 0) {
                myMessages[myMessages.length - 1].status = 'read';
            }
            
            if(state.activeId === contact.id) {
                renderMessages(state.activeId);
            }
            updateSingleContact(state.activeId);
            Storage.save();
        }, 2000);
    }
};

// ==========================================================================
// START APPLICATION
// ==========================================================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', App.init);
} else {
    App.init();
}