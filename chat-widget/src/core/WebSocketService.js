// src/core/WebSocketService.js
export default class WebSocketService {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
    this.reconnectDelay = 3000;
  }

  connect() {
    try {
      this.socket = new WebSocket(this.url);
      this.setupEventListeners();
    } catch (error) {
      this.emit('error', new Error('Failed to create WebSocket connection'));
    }
  }

  setupEventListeners() {
    this.socket.onopen = () => {
      this.reconnectAttempts = 0;
      this.emit('open');
    };

    this.socket.onclose = (event) => {
      this.emit('close', event);
      if (!event.wasClean) {
        this.handleReconnect();
      }
    };

    this.socket.onerror = (error) => {
      this.emit('error', error);
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit('message', data);
      } catch (error) {
        this.emit('error', new Error('Invalid message format'));
      }
    };
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      this.emit('error', new Error('Max reconnection attempts reached'));
    }
  }

  send(message) {
    if (!this.isConnected()) {
      throw new Error('WebSocket is not connected');
    }

    try {
      this.socket.send(JSON.stringify({
        type: 'message',
        content: message,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      this.emit('error', new Error('Failed to send message'));
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return this;
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
    return this;
  }

  emit(event, ...args) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.listeners.clear();
  }

  updateUrl(newUrl) {
    if (!newUrl) {
      throw new Error('WebSocket URL cannot be empty');
    }
    this.url = newUrl;
    if (this.isConnected()) {
      this.disconnect();
      this.connect();
    }
  }
}