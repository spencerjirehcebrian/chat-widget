import WebSocketService from './WebSocketService';
import UIManager from '../ui/UIManager';

export default class ChatManager {
  constructor(config) {
    this.validateConfig(config);
    this.config = config;
    this.uiManager = new UIManager(config);
    this.wsService = new WebSocketService(config.serverUrl);
    this.messageQueue = [];
    
    this.initializeEventListeners();
    this.initializeWebSocketHandlers();
  }

  validateConfig(config) {
    const requiredFields = ['serverUrl', 'title', 'iconPath', 'sendIconPath'];
    for (const field of requiredFields) {
      if (!config[field]) {
        throw new Error(`Missing required config field: ${field}`);
      }
    }
  }

  initializeEventListeners() {
    this.uiManager.on('send-message', (message) => {
      if (message.trim()) {
        this.handleOutgoingMessage(message);
      }
    });

    this.uiManager.on('toggle-chat', () => {
      if (!this.wsService.isConnected()) {
        this.wsService.connect();
      }
    });
  }

  handleOutgoingMessage(message) {
    try {
      if (this.wsService.isConnected()) {
        this.wsService.send(message);
        // Show typing indicator after user message
        setTimeout(() => {
          this.uiManager.showLoadingIndicator();
        }, 500); // Small delay to make it feel more natural
      } else {
        this.messageQueue.push(message);
        this.wsService.connect();
        this.uiManager.showError('Network error. Connecting to server...');
      }
    } catch (error) {
      this.uiManager.showError('Unable to send message. Please try again.');
    }
  }
  initializeWebSocketHandlers() {
    this.wsService
      .on('open', () => {
        this.processMessageQueue();
      })
      .on('close', () => {
        // No need to show initial disconnect message as retry will show immediately
      })
      .on('reconnect-attempt', (attempt, maxAttempts) => {
        this.uiManager.handleConnectionRetry(attempt, maxAttempts);
      })
      .on('error', (error) => {
        console.error('WebSocket error:', error);
      })
      .on('connection-failed', (message) => {
        this.uiManager.showError(message);
      })
      .on('message', (message) => {
        if (message.content) {
          this.uiManager.addMessage(message.content, message.sender || 'bot');
        }
      });
    }
  

  processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.handleOutgoingMessage(message);
    }
  }

  updateConfig(newConfig) {
    this.validateConfig({ ...this.config, ...newConfig });
    this.config = { ...this.config, ...newConfig };
    this.uiManager.updateConfig(this.config);
    
    if (newConfig.serverUrl) {
      this.wsService.updateUrl(newConfig.serverUrl);
    }
  }

  destroy() {
    this.wsService.disconnect();
    this.uiManager.destroy();
  }
}