// src/index.js
import './ui/styles.css';
import ChatManager from './core/ChatManager';

const DEFAULT_ICONS = {
  chat: `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  `)}`,
  send: `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  `)}`,
  botAvatar: `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <!-- Background circle with gradient -->
      <circle cx="16" cy="16" r="16" fill="url(#gradient)"/>
      <!-- Gradient definition -->
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#000000"/>
          <stop offset="100%" stop-color="#333333"/>
        </linearGradient>
      </defs>
      <!-- Futuristic bot head -->
      <circle cx="16" cy="12" r="4" fill="#ffffff"/>
      <!-- Bot body -->
      <rect x="10" y="18" width="12" height="8" rx="2" fill="#ffffff"/>
      <!-- Glowing effect -->
      <circle cx="16" cy="16" r="16" fill="none" stroke="rgba(255, 255, 255, 0.2)" stroke-width="2"/>
    </svg>
  `)}`
};

const defaultConfig = {
  position: 'bottom-right',
  primaryColor: '#007bff',
  title: 'Chat with us',
  serverUrl: 'ws://localhost:3000',
  iconPath: DEFAULT_ICONS.chat,
  sendIconPath: DEFAULT_ICONS.send,
  botAvatarUrl: DEFAULT_ICONS.botAvatar,
  statusMessages: {
    connected: 'Online',
    disconnected: 'Offline',
    error: 'Connection error'
  }
};

const ChatWidget = {
  init: (userConfig = {}) => {
    const config = { 
      ...defaultConfig, 
      ...userConfig,
      // Ensure icons are set even if userConfig doesn't provide them
      iconPath: userConfig.iconPath || DEFAULT_ICONS.chat,
      sendIconPath: userConfig.sendIconPath || DEFAULT_ICONS.send,
      botAvatarUrl: userConfig.botAvatarUrl || DEFAULT_ICONS.botAvatar
    };
    return new ChatManager(config);
  }
};

export default ChatWidget;