document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const authPage = document.getElementById('auth-page');
    const app = document.getElementById('app');
    const loginButton = document.getElementById('login-button');
    const authForm = document.getElementById('auth-form');
    const onboarding = document.getElementById('onboarding');
    const slides = document.querySelectorAll('#slides .slide');
    const dots = document.querySelectorAll('.slide-dots .dot');
    const nextOnboarding = document.getElementById('next-onboarding');
    const skipOnboarding = document.getElementById('skip-onboarding');
    const signupForm = document.getElementById('signup-form');
    const verifyForm = document.getElementById('verify-form');
    const forgotForm = document.getElementById('forgot-form');
    const resetForm = document.getElementById('reset-form');
    const goSignup = document.getElementById('go-signup');
    const goForgot = document.getElementById('go-forgot');
    const goLogin1 = document.getElementById('go-login-1');
    const goLogin2 = document.getElementById('go-login-2');
    const goLogin3 = document.getElementById('go-login-3');
    const goLogin4 = document.getElementById('go-login-4');
    const resendCode = document.getElementById('resend-code');
    const themeButton = document.getElementById('theme-button');
    const settingsButton = document.getElementById('settings-button');
    const logoutButton = document.getElementById('logout-button');
    const switchToSignup = document.getElementById('switch-to-signup');
    const sidebar = document.getElementById('sidebar');
    const burgerMenu = document.getElementById('burger-menu');
    const closeSidebar = document.getElementById('close-sidebar');
    const overlay = document.getElementById('overlay');
    const sendButton = document.querySelector('.send-button');
    const messageInput = document.getElementById('message-input');
    const messagesContainer = document.querySelector('.messages-container');
    const conversations = document.querySelectorAll('.conversation');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettings = document.getElementById('close-settings');
    const typingIndicator = document.getElementById('typing-indicator');
    const tabs = document.querySelectorAll('.tab');
    const liveRegion = document.getElementById('live-region');
    
    // State variables
    let isTyping = false;
    let typingTimer;
    
    // Respect saved theme
    const savedTheme = localStorage.getItem('prism-theme');
    // Onboarding flow
    let currentSlide = 0;
    function updateSlides(index) {
        slides.forEach((s, i) => {
            s.classList.toggle('active', i === index);
        });
        dots.forEach((d, i) => {
            d.classList.toggle('active', i === index);
        });
        nextOnboarding.textContent = index === slides.length - 1 ? 'Done' : 'Next';
    }

    function showLogin() {
        onboarding.classList.add('hidden');
        authForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        verifyForm.classList.add('hidden');
        forgotForm.classList.add('hidden');
        resetForm.classList.add('hidden');
        document.getElementById('email').focus();
    }

    if (onboarding) {
        updateSlides(currentSlide);
        nextOnboarding.addEventListener('click', function() {
            if (currentSlide < slides.length - 1) {
                currentSlide += 1;
                updateSlides(currentSlide);
            } else {
                showLogin();
            }
        });
        skipOnboarding.addEventListener('click', showLogin);
        dots.forEach(d => {
            d.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-index'), 10);
                currentSlide = idx;
                updateSlides(currentSlide);
            });
        });
    }

    // Navigation between auth screens
    if (goSignup) goSignup.addEventListener('click', function() {
        authForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        document.getElementById('signup-email').focus();
    });
    if (goForgot) goForgot.addEventListener('click', function() {
        authForm.classList.add('hidden');
        forgotForm.classList.remove('hidden');
        document.getElementById('forgot-email').focus();
    });
    [goLogin1, goLogin2, goLogin3, goLogin4].forEach(btn => {
        if (btn) btn.addEventListener('click', showLogin);
    });

    // Signup submit -> show verify form with mock code
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('signup-email').value.trim();
            const p1 = document.getElementById('signup-password').value.trim();
            const p2 = document.getElementById('signup-password2').value.trim();
            if (!email || !p1 || !p2) {
                announce('Please fill in all fields');
                return;
            }
            if (p1 !== p2) {
                announce('Passwords do not match');
                return;
            }
            // Mock: generate code and store for validation
            const code = String(Math.floor(100000 + Math.random() * 900000));
            localStorage.setItem('prism-signup-code', code);
            localStorage.setItem('prism-signup-email', email);
            announce('Verification code sent');
            signupForm.classList.add('hidden');
            verifyForm.classList.remove('hidden');
            focusFirstCodeField(verifyForm);
        });
    }

    // Resend code (mock)
    if (resendCode) {
        resendCode.addEventListener('click', function() {
            const code = String(Math.floor(100000 + Math.random() * 900000));
            localStorage.setItem('prism-signup-code', code);
            announce('New verification code sent');
        });
    }

    // Verify code -> proceed to app
    if (verifyForm) {
        verifyForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const fields = verifyForm.querySelectorAll('.code-field');
            const entered = Array.from(fields).map(f => f.value).join('');
            const stored = localStorage.getItem('prism-signup-code');
            if (entered.length !== 6) {
                announce('Enter the 6-digit code');
                return;
            }
            if (entered !== stored) {
                announce('Invalid code');
                return;
            }
            // Success
        authPage.style.display = 'none';
        app.style.display = 'flex';
            announce('Account verified');
        });
    }

    // Forgot -> send code, then show reset form
    if (forgotForm) {
        forgotForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('forgot-email').value.trim();
            if (!email) {
                announce('Enter your email');
                return;
            }
            const code = String(Math.floor(100000 + Math.random() * 900000));
            localStorage.setItem('prism-reset-code', code);
            localStorage.setItem('prism-reset-email', email);
            announce('Reset code sent');
            forgotForm.classList.add('hidden');
            resetForm.classList.remove('hidden');
            focusFirstCodeField(resetForm);
        });
    }

    // Reset submit -> validate code and passwords
    if (resetForm) {
        resetForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const fields = resetForm.querySelectorAll('.code-field');
            const entered = Array.from(fields).map(f => f.value).join('');
            const stored = localStorage.getItem('prism-reset-code');
            const p1 = document.getElementById('new-password').value.trim();
            const p2 = document.getElementById('new-password2').value.trim();
            if (entered.length !== 6) {
                announce('Enter the 6-digit code');
                return;
            }
            if (entered !== stored) {
                announce('Invalid code');
                return;
            }
            if (!p1 || !p2) {
                announce('Please fill in all fields');
                return;
            }
            if (p1 !== p2) {
                announce('Passwords do not match');
                return;
            }
            announce('Password updated');
            showLogin();
        });
    }

    // Auto-advance code fields
    function focusFirstCodeField(scope) {
        const fields = scope.querySelectorAll('.code-field');
        if (fields.length) fields[0].focus();
    }
    document.querySelectorAll('.code-field').forEach((field, idx, list) => {
        field.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').slice(0, 1);
            if (this.value && idx < list.length - 1) {
                list[idx + 1].focus();
            }
        });
        field.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && !this.value && idx > 0) {
                list[idx - 1].focus();
            }
        });
    });
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeButton) {
            themeButton.innerHTML = '<i class="fas fa-sun"></i>';
            themeButton.setAttribute('title', 'Light theme');
        }
    }
    
    // Auth submit (prevent default navigation)
    if (authForm) {
        authForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            if (!email || !password) {
                announce('Please fill in all fields');
                return;
            }
            // Simple fake auth for demo
            authPage.style.display = 'none';
            app.style.display = 'flex';
            announce('Signed in');
        });
    } else if (loginButton) {
        // Fallback: click handler
    loginButton.addEventListener('click', function() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        if (!email || !password) {
                announce('Please fill in all fields');
            return;
        }
        authPage.style.display = 'none';
        app.style.display = 'flex';
            announce('Signed in');
    });
    }
    
    // Logout function
    logoutButton.addEventListener('click', function() {
        authPage.style.display = 'flex';
        app.style.display = 'none';
        closeSidebarMenu();
    });
    
    // Toggle between signup and login
    switchToSignup.addEventListener('click', function(e) {
        e.preventDefault();
        const authBox = document.querySelector('.auth-box');
        if (authBox.querySelector('h1').textContent.includes('Sign In')) {
            authBox.querySelector('h1').innerHTML = '<i class="fas fa-lock"></i> Create Account';
            authBox.querySelector('.auth-button').textContent = "Sign Up";
            authBox.querySelector('.auth-switch p').innerHTML = 'Already have an account? <a href="#" id="switch-to-signup">Sign In</a>';
        } else {
            authBox.querySelector('h1').innerHTML = '<i class="fas fa-lock"></i> Prism';
            authBox.querySelector('.auth-button').textContent = "Sign In";
            authBox.querySelector('.auth-switch p').innerHTML = 'Don\'t have an account? <a href="#" id="switch-to-signup">Sign Up</a>';
        }
    });
    
    // Toggle dark/light theme
    themeButton.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            themeButton.innerHTML = '<i class="fas fa-sun"></i>';
            themeButton.setAttribute('title', 'Light theme');
            localStorage.setItem('prism-theme', 'dark');
        } else {
            themeButton.innerHTML = '<i class="fas fa-moon"></i>';
            themeButton.setAttribute('title', 'Dark theme');
            localStorage.setItem('prism-theme', 'light');
        }
    });
    
    // Tab switching functionality
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Here you would typically filter conversations based on the selected tab
            // For this demo, we'll just show a simple alert
            const tabName = this.textContent;
            console.log(`Switched to ${tabName} tab`);
        });
    });
    
    // Open settings
    settingsButton.addEventListener('click', function() {
        settingsModal.style.display = 'flex';
    });
    
    // Close settings
    closeSettings.addEventListener('click', function() {
        settingsModal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });
    
    // Open burger menu
    burgerMenu.addEventListener('click', function() {
        sidebar.classList.add('active');
        overlay.classList.add('active');
    });
    
    // Close burger menu
    closeSidebar.addEventListener('click', closeSidebarMenu);
    overlay.addEventListener('click', closeSidebarMenu);
    
    function closeSidebarMenu() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    }
    
    // Typing detection for indicator
    messageInput.addEventListener('input', function() {
        if (!isTyping) {
            isTyping = true;
            typingIndicator.classList.add('active');
            simulateTyping();
        }
        
        clearTimeout(typingTimer);
        typingTimer = setTimeout(function() {
            isTyping = false;
            typingIndicator.classList.remove('active');
        }, 1000);
    });
    
    function simulateTyping() {
        // Simulate the other person typing
        setTimeout(function() {
            if (isTyping) {
                typingIndicator.classList.add('active');
            }
        }, 500);
    }
    
    // Send message
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    function sendMessage() {
        const messageText = messageInput.value.trim();
        if (messageText) {
            // Create new message element
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message sent';
            
            const messageContent = document.createElement('div');
            messageContent.className = 'message-content';
            
            const messageParagraph = document.createElement('p');
            messageParagraph.textContent = messageText;
            
            const messageTime = document.createElement('span');
            messageTime.className = 'message-time';
            
            // Get current time
            const now = new Date();
            let hours = now.getHours();
            let minutes = now.getMinutes();
            hours = hours < 10 ? '0' + hours : hours;
            minutes = minutes < 10 ? '0' + minutes : minutes;
            const timeString = hours + ':' + minutes;
            
            messageTime.textContent = timeString;

            // Delivery state container (sent/delivered/read)
            const delivery = document.createElement('span');
            delivery.className = 'delivery-state';
            delivery.innerHTML = '<i class="fas fa-check"></i>';
            
            messageContent.appendChild(messageParagraph);
            messageDiv.appendChild(messageContent);
            messageDiv.appendChild(messageTime);
            messageDiv.appendChild(delivery);
            
            messagesContainer.appendChild(messageDiv);
            
            // Clear input field
            messageInput.value = '';
            sendButton.disabled = true;
            // Clear draft for this conversation
            const id = getActiveConversationId();
            saveDraft(id, '');
            
            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            // Stop typing indicator
            isTyping = false;
            typingIndicator.classList.remove('active');
            clearTimeout(typingTimer);
            
            // Simulate reply after a short delay
            setTimeout(simulateReply, 1000 + Math.random() * 2000);
            announce('Message sent');

            // Simulate delivery states
            setTimeout(() => {
                delivery.innerHTML = '<i class="fas fa-check-double"></i>';
                delivery.title = 'Delivered';
            }, 500);
            setTimeout(() => {
                delivery.innerHTML = '<i class="fas fa-check-double" style="color: var(--primary);"></i>';
                delivery.title = 'Read';
            }, 1500);
        }
    }
    
    function simulateReply() {
        const replies = [
            "Thanks for your message!",
            "I'll get back to you soon.",
            "That's interesting!",
            "Tell me more about that.",
            "I agree with you.",
            "Can we talk about this later?"
        ];

        const randomReply = replies[Math.floor(Math.random() * replies.length)];

        // Decide target conversation: prefer a non-active conversation if available
        const activeId = getActiveConversationId();
        const all = Array.from(conversations);
        const others = all.filter(c => c.getAttribute('data-id') && c.getAttribute('data-id') !== activeId);
        const target = others.length ? others[Math.floor(Math.random() * others.length)] : all.find(c => c.getAttribute('data-id') === activeId);
        const targetId = target ? target.getAttribute('data-id') : activeId;

        // Time string
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        const timeString = hours + ':' + minutes;

        if (targetId && targetId === activeId) {
            // Append message to the open chat
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message received';
            const messageContent = document.createElement('div');
            messageContent.className = 'message-content';
            const messageParagraph = document.createElement('p');
            messageParagraph.textContent = randomReply;
            const messageTime = document.createElement('span');
            messageTime.className = 'message-time';
            messageTime.textContent = timeString;
            messageContent.appendChild(messageParagraph);
            messageDiv.appendChild(messageContent);
            messageDiv.appendChild(messageTime);
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            sendButton.disabled = false;
            messageInput.focus();
            announce('New message received');
            // Do not increment unread for the active conversation
        } else if (target) {
            // Update sidebar preview and unread for the non-active conversation
            const lastMsg = target.querySelector('.last-message .text');
            if (lastMsg) lastMsg.textContent = randomReply;
            const timeEl = target.querySelector('.conversation-header .time');
            if (timeEl) timeEl.textContent = timeString;
            const current = getUnreadCount(targetId);
            setUnreadCount(targetId, current + 1);
            announce('New message in another conversation');
        }
    }
    
    // Switch conversation
    conversations.forEach(conversation => {
        conversation.addEventListener('click', function() {
            // Remove active class from all conversations
            conversations.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked conversation
            this.classList.add('active');
            
            // Update contact name in chat header
            const contactName = this.querySelector('.contact-name').textContent;
            document.querySelector('.partner-name').textContent = contactName;
            
            // Update avatar in chat header
            const avatar = this.querySelector('.avatar').cloneNode(true);
            const currentAvatar = document.querySelector('.chat-partner .avatar');
            currentAvatar.parentNode.replaceChild(avatar, currentAvatar);
            
            // Load draft for this conversation
            const id = this.getAttribute('data-id');
            messageInput.value = loadDraft(id);
            toggleSendAvailability();
            // Clear unread for opened conversation
            setUnreadCount(id, 0);
            
            // Close menu on mobile
            closeSidebarMenu();
        });
    });
    
    // Conversation search
    const searchInput = document.querySelector('.search-input input');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const conversationItems = document.querySelectorAll('.conversation');
        
        conversationItems.forEach(item => {
            const contactName = item.querySelector('.contact-name').textContent.toLowerCase();
            const lastMessage = item.querySelector('.text').textContent.toLowerCase();
            
            if (contactName.includes(searchTerm) || lastMessage.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });

    // Enable/disable send button based on input
    function toggleSendAvailability() {
        const hasText = messageInput.value.trim().length > 0;
        sendButton.disabled = !hasText;
    }
    toggleSendAvailability();
    messageInput.addEventListener('input', toggleSendAvailability);

    // Draft persistence per conversation
    function getActiveConversationId() {
        const active = document.querySelector('.conversation.active');
        return active ? active.getAttribute('data-id') : 'default';
    }

    function storageKeyForDraft(convId) {
        return `prism-draft-${convId}`;
    }

    function loadDraft(convId) {
        const saved = localStorage.getItem(storageKeyForDraft(convId));
        return saved || '';
    }

    function saveDraft(convId, text) {
        if (!text) {
            localStorage.removeItem(storageKeyForDraft(convId));
        } else {
            localStorage.setItem(storageKeyForDraft(convId), text);
        }
        updateDraftBadge(convId, text);
    }

    function updateDraftBadge(convId, text) {
        const item = document.querySelector(`.conversation[data-id="${convId}"]`);
        if (!item) return;
        const lastMsg = item.querySelector('.last-message .text');
        if (!lastMsg) return;
        const existing = item.querySelector('.last-message .draft-badge');
        if (text && text.length > 0) {
            if (!existing) {
                const badge = document.createElement('span');
                badge.className = 'draft-badge';
                badge.textContent = 'Draft:';
                lastMsg.parentNode.insertBefore(badge, lastMsg);
                // Cache original snippet so we can restore later
                const cacheKey = `prism-lastmsg-${convId}`;
                if (!localStorage.getItem(cacheKey)) {
                    localStorage.setItem(cacheKey, lastMsg.textContent);
                }
            }
            lastMsg.textContent = text.slice(0, 28) + (text.length > 28 ? '…' : '');
        } else if (existing) {
            // Restore original last message preview if cached
            const cacheKey = `prism-lastmsg-${convId}`;
            const original = localStorage.getItem(cacheKey);
            if (original !== null) {
                lastMsg.textContent = original;
                localStorage.removeItem(cacheKey);
            }
            existing.remove();
        }
    }

    // Initialize draft indicators
    conversations.forEach(c => {
        const id = c.getAttribute('data-id');
        if (!id) return;
        const draft = loadDraft(id);
        if (draft) updateDraftBadge(id, draft);
    });

    // Load draft on active conversation
    (function initActiveDraft() {
        const id = getActiveConversationId();
        messageInput.value = loadDraft(id);
        toggleSendAvailability();
    })();

    // Save draft as user types
    messageInput.addEventListener('input', function() {
        const id = getActiveConversationId();
        saveDraft(id, messageInput.value);
    });

    // Unread counters persistence
    function storageKeyForUnread(convId) {
        return `prism-unread-${convId}`;
    }

    function getUnreadCount(convId) {
        const saved = localStorage.getItem(storageKeyForUnread(convId));
        return saved ? parseInt(saved, 10) : 0;
    }

    function setUnreadCount(convId, count) {
        if (count <= 0) {
            localStorage.removeItem(storageKeyForUnread(convId));
        } else {
            localStorage.setItem(storageKeyForUnread(convId), String(count));
        }
        updateUnreadUI(convId, count);
    }

    function updateUnreadUI(convId, count) {
        const item = document.querySelector(`.conversation[data-id="${convId}"]`);
        if (!item) return;
        let badge = item.querySelector('.unread-count');
        if (count > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'unread-count';
                const container = item.querySelector('.last-message');
                if (container) container.appendChild(badge);
            }
            badge.textContent = String(count);
        } else if (badge) {
            badge.remove();
        }
    }

    // Initialize unread from DOM or storage
    conversations.forEach(c => {
        const id = c.getAttribute('data-id');
        if (!id) return;
        const stored = getUnreadCount(id);
        if (stored > 0) {
            updateUnreadUI(id, stored);
        } else {
            // read DOM as baseline
            const badge = c.querySelector('.unread-count');
            if (badge && badge.textContent) {
                const baseline = parseInt(badge.textContent, 10) || 0;
                if (baseline > 0) setUnreadCount(id, baseline);
            }
        }
    });

    // Live region announcer
    function announce(message) {
        if (!liveRegion) return;
        liveRegion.textContent = '';
        setTimeout(() => {
            liveRegion.textContent = message;
        }, 10);
    }
});