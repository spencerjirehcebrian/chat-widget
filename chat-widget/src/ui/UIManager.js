// src/ui/UIManager.js
export default class UIManager {
  constructor(config) {
    this.config = config;
    this.listeners = {};
    this.initializeUI();
    this.handleKeyboardNavigation();
  }

  initializeUI() {
    this.createContainer();
    this.createChatBox();
    this.createButton();
    this.applyAccessibility();
    
    // Add click handler directly to the button
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
        <div class="chat-widget-status"></div>
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
      const input = this.form.querySelector('input');
      const message = input.value.trim();
      if (message) {
        this.emit('send-message', message);
        input.value = '';
      }
    });
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

  updateConnectionStatus(status) {
    const statusEl = this.chatBox.querySelector('.chat-widget-status');
    statusEl.className = `chat-widget-status ${status}`;
    statusEl.textContent = this.config.statusMessages[status] || status;
  }

  addMessage(content, sender) {
    const messages = this.chatBox.querySelector('.chat-widget-messages');
    
    if (sender === 'bot') {
      const containerEl = document.createElement('div');
      containerEl.className = 'chat-message-container bot';
      
      const avatarEl = document.createElement('div');
      avatarEl.className = 'chat-message-avatar';
      avatarEl.innerHTML = `<img src="${this.config.botAvatarUrl}" alt="Bot Avatar">`;
      
      const messageEl = document.createElement('div');
      messageEl.className = `chat-message ${sender}`;
      messageEl.textContent = content;
      
      containerEl.appendChild(avatarEl);
      containerEl.appendChild(messageEl);
      messages.appendChild(containerEl);
    } else {
      const messageEl = document.createElement('div');
      messageEl.className = `chat-message ${sender}`;
      messageEl.textContent = content;
      messages.appendChild(messageEl);
    }
    
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

  showError(message) {
    const errorEl = document.createElement('div');
    errorEl.className = 'chat-message error';
    errorEl.textContent = message;
    this.chatBox.querySelector('.chat-widget-messages').appendChild(errorEl);
    
    setTimeout(() => {
      errorEl.remove();
    }, 5000);
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