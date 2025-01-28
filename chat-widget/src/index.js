// src/index.js
import './ui/styles.css';
import ChatManager from './core/ChatManager';
// Import SVGs as raw strings
import chatIcon from '../assets/icons/chat.svg';
import sendIcon from '../assets/icons/send.svg';
import botAvatarIcon from '../assets/logo/botAvatar.png';

const DEFAULT_ICONS = {
  chat: chatIcon,
  send: sendIcon,
  botAvatar: botAvatarIcon
};

const defaultConfig = {
  position: 'bottom-right',
  primaryColor: '#007bff',
  title: 'Chatty',
  serverUrl: 'ws://localhost:3000',
  iconPath: DEFAULT_ICONS.chat,
  sendIconPath: DEFAULT_ICONS.send,
  botAvatarUrl: DEFAULT_ICONS.botAvatar,
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