// src/ui/UIManager.js
export default class UIManager {
  constructor(config) {
    this.config = config;
    this.listeners = {};
    this.isBotResponding = false;
    this.initializeUI();
    this.handleKeyboardNavigation();

  }

  initializeUI() {
    this.createContainer();
    this.createChatBox();
    this.createButton();
    this.applyAccessibility();
    
    this.button.addEventListener('click', () => {
      this.toggleChat();
      this.emit('toggle-chat');
    });
  }

  createContainer() {
    this.container = document.createElement('div');
    this.container.className = 'chat-widget-container';
    document.body.appendChild(this.container);
  }

  createButton() {
    this.button = document.createElement('button');
    this.button.className = 'chat-widget-toggle';
    this.button.innerHTML = `
      <img src="${this.config.iconPath}" 
           alt="${this.config.title} icon" 
           class="chat-widget-icon">
    `;
    this.container.appendChild(this.button);
  }

  createChatBox() {
    this.chatBox = document.createElement('div');
    this.chatBox.className = 'chat-widget-box';
    this.chatBox.innerHTML = `
      <header class="chat-widget-header">
        <h2>${this.config.title}</h2>
      </header>
      <div class="chat-widget-messages"></div>
      <form class="chat-widget-form">
        <input type="text" 
               aria-label="Type your message" 
               placeholder="${this.config.inputPlaceholder || 'Type a message...'}">
        <button type="submit">
          <img src="${this.config.sendIconPath}" 
               alt="Send message" 
               class="chat-widget-send-icon">
        </button>
      </form>
    `;
    this.container.appendChild(this.chatBox);
    
    this.form = this.chatBox.querySelector('form');
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.isBotResponding) return;
      const input = this.form.querySelector('input');
      const message = input.value.trim();
      if (message) {
        this.emit('send-message', message);
        input.value = '';
      }
    });
  }

setBotResponding(isResponding) {
    this.isBotResponding = isResponding;
    const input = this.form.querySelector('input');
    const submitButton = this.form.querySelector('button[type="submit"]');
    
    if (isResponding) {
        submitButton.setAttribute('disabled', 'disabled');
    } else {
        input.removeAttribute('disabled');
        submitButton.removeAttribute('disabled');
        input.placeholder = this.config.inputPlaceholder || 'Type a message...';
    }
}


  toggleChat() {
    if (!this.chatBox) return;
    
    const isVisible = this.chatBox.classList.contains('visible');
    this.chatBox.classList.toggle('visible');
    this.button.setAttribute('aria-expanded', (!isVisible).toString());
    
    if (!isVisible) {
      const input = this.chatBox.querySelector('input');
      if (input) input.focus();
    }
  }

  handleKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isChatVisible()) {
        this.toggleChat();
      }
    });
  }

  isChatVisible() {
    return this.chatBox?.classList.contains('visible');
  }

  showLoadingIndicator() {
    this.setBotResponding(true); 
    const messages = this.chatBox.querySelector('.chat-widget-messages');
    
    // Create container for bot message with avatar
    const containerEl = document.createElement('div');
    containerEl.className = 'chat-message-container bot';
    
    // Add bot avatar
    const avatarEl = document.createElement('div');
    avatarEl.className = 'chat-message-avatar';
    avatarEl.innerHTML = `<img src="${this.config.botAvatarUrl}" alt="Bot Avatar">`;
    
    // Create typing indicator
    const typingEl = document.createElement('div');
    typingEl.className = 'typing-indicator';
    typingEl.innerHTML = `
      <div class="typing-bubble"></div>
      <div class="typing-bubble"></div>
      <div class="typing-bubble"></div>
    `;
    
    containerEl.appendChild(avatarEl);
    containerEl.appendChild(typingEl);
    messages.appendChild(containerEl);
    messages.scrollTop = messages.scrollHeight;
    
    return containerEl; // Return the container so we can remove it later
  }

  removeLoadingIndicator() {
    // Direct and simple removal
    const messages = this.chatBox.querySelector('.chat-widget-messages');
    const loadingIndicators = messages.querySelectorAll('.typing-indicator');
    
    loadingIndicators.forEach(indicator => {
      const container = indicator.closest('.chat-message-container');
      if (container) {
        container.remove();
      } else {
        indicator.remove();
      }
    });
  }
  addMessage(content, sender) {
    const messages = this.chatBox.querySelector('.chat-widget-messages');
    
    if (sender === 'bot') {
        this.setBotResponding(true);
      const containerEl = document.createElement('div');
      containerEl.className = 'chat-message-container bot';
      
      const avatarEl = document.createElement('div');
      avatarEl.className = 'chat-message-avatar';
      avatarEl.innerHTML = `<img src="${this.config.botAvatarUrl}" alt="Bot Avatar">`;
      
      const messageEl = document.createElement('div');
      messageEl.className = `chat-message ${sender}`;
      
      // Create a span for the animated text
      const textSpan = document.createElement('span');
      textSpan.className = 'message-text';
      messageEl.appendChild(textSpan);
      
      containerEl.appendChild(avatarEl);
      containerEl.appendChild(messageEl);
      messages.appendChild(containerEl);

      // Animate the text
      let currentText = '';
      const animationSpeed = 10; // ms per character
      const chars = content.split('');
      
      const animate = () => {
        if (chars.length === 0) {
            this.setBotResponding(false);  // Add this line
            return;
        }
        currentText += chars.shift();
        textSpan.textContent = currentText;
        messages.scrollTop = messages.scrollHeight;
        if (chars.length > 0) {
            setTimeout(animate, animationSpeed);
        } else {
            this.setBotResponding(false);  // Add this line
        }
    };
      
      animate();
      this.removeLoadingIndicator();
    } else {
      const messageEl = document.createElement('div');
      messageEl.className = `chat-message ${sender}`;
      messageEl.textContent = content;
      messages.appendChild(messageEl);
    }
    
    messages.scrollTop = messages.scrollHeight;
  }

  handleConnectionRetry(attempt, maxAttempts) {
    // Remove any existing retry messages
    const existingRetryMessages = this.chatBox.querySelectorAll('.chat-message.system.retry');
    existingRetryMessages.forEach(el => el.remove());
    
    const message = `Network error. Retrying connection... (Attempt ${attempt}/${maxAttempts})`;
    const messages = this.chatBox.querySelector('.chat-widget-messages');
    const messageEl = document.createElement('div');
    messageEl.className = 'chat-message system retry error';
    
    const containerEl = document.createElement('div');
    containerEl.className = 'chat-message-container system';
    
    messageEl.innerHTML = `
      ${message}
    `;
    
    containerEl.appendChild(messageEl);
    messages.appendChild(containerEl);
    messages.scrollTop = messages.scrollHeight;
  }

  showError(message) {
    const messages = this.chatBox.querySelector('.chat-widget-messages');
    const messageEl = document.createElement('div');
    messageEl.className = 'chat-message system error';
    
    // Create container for system messages
    const containerEl = document.createElement('div');
    containerEl.className = 'chat-message-container system';
    
    messageEl.innerHTML = `
      ${message}
    `;
    
    containerEl.appendChild(messageEl);
    messages.appendChild(containerEl);
    messages.scrollTop = messages.scrollHeight;
  }


  updateConfig(config) {
    this.config = { ...this.config, ...config };
    // Update dynamic elements
    this.chatBox.querySelector('h2').textContent = this.config.title;
    this.button.querySelector('img').src = this.config.iconPath;
    this.chatBox.querySelector('.chat-widget-send-icon').src = this.config.sendIconPath;
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }
    this.listeners[event].add(callback);
  }

  emit(event, ...args) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  destroy() {
    if (this.container) {
      this.container.remove();
    }
  }

  applyAccessibility() {
    this.button.setAttribute('aria-label', 'Toggle chat widget');
    this.button.setAttribute('aria-expanded', 'false');
    this.chatBox.setAttribute('role', 'dialog');
    this.chatBox.setAttribute('aria-label', this.config.title);
    this.chatBox.setAttribute('aria-modal', 'true');
  }
}