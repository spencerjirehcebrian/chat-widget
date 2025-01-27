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
        // this.uiManager.addMessage(message, 'user');
      } else {
        this.messageQueue.push(message);
        this.wsService.connect();
      }
    } catch (error) {
      this.uiManager.showError('Failed to send message');
    }
  }

  initializeWebSocketHandlers() {
    this.wsService
      .on('open', () => {
        this.uiManager.updateConnectionStatus('connected');
        this.processMessageQueue();
      })
      .on('close', () => {
        this.uiManager.updateConnectionStatus('disconnected');
      })
      .on('error', (error) => {
        this.uiManager.showError(error.message);
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