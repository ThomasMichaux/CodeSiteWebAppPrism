document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const authPage = document.getElementById('auth-page');
    const app = document.getElementById('app');
    const loginButton = document.getElementById('login-button');
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
    
    // State variables
    let isTyping = false;
    let typingTimer;
    
    // Auto-login for preview
    setTimeout(function() {
        authPage.style.display = 'none';
        app.style.display = 'flex';
    }, 1000);
    
    // Login function
    loginButton.addEventListener('click', function() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Basic validation
        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }
        
        authPage.style.display = 'none';
        app.style.display = 'flex';
    });
    
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
        } else {
            themeButton.innerHTML = '<i class="fas fa-moon"></i>';
            themeButton.setAttribute('title', 'Dark theme');
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
            
            messageContent.appendChild(messageParagraph);
            messageDiv.appendChild(messageContent);
            messageDiv.appendChild(messageTime);
            
            messagesContainer.appendChild(messageDiv);
            
            // Clear input field
            messageInput.value = '';
            
            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            // Stop typing indicator
            isTyping = false;
            typingIndicator.classList.remove('active');
            clearTimeout(typingTimer);
            
            // Simulate reply after a short delay
            setTimeout(simulateReply, 1000 + Math.random() * 2000);
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
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message received';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const messageParagraph = document.createElement('p');
        messageParagraph.textContent = randomReply;
        
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
        
        messageContent.appendChild(messageParagraph);
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(messageTime);
        
        messagesContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
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
});