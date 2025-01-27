// chat-widget.js
(function() {
    // Configuration object with defaults
    const config = {
        position: 'bottom-right',
        primaryColor: '#007bff',
        title: 'Chat with us',
        serverUrl: 'ws://localhost:3000'
    };

    let ws = null;

    // Create and inject CSS
    const style = document.createElement('style');
    style.textContent = `
        .chat-widget-container {
            position: fixed;
            z-index: 9999;
            bottom: 20px;
            right: 20px;
            display: flex;
            flex-direction: column;
            font-family: Arial, sans-serif;
        }

        .chat-widget-button {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background-color: #007bff;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
        }

        .chat-widget-button svg {
            width: 30px;
            height: 30px;
            fill: white;
        }

        .chat-widget-box {
            position: absolute;
            bottom: 80px;
            right: 0;
            width: 300px;
            height: 400px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
            display: none;
            flex-direction: column;
        }

        .chat-widget-box.active {
            display: flex;
        }

        .chat-widget-header {
            padding: 15px;
            background-color: #007bff;
            color: white;
            border-radius: 10px 10px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .chat-widget-messages {
            flex-grow: 1;
            padding: 15px;
            overflow-y: auto;
        }

        .chat-widget-message {
            margin-bottom: 10px;
            padding: 8px 12px;
            border-radius: 15px;
            max-width: 80%;
            word-wrap: break-word;
        }

        .chat-widget-message.user {
            background-color: #007bff;
            color: white;
            margin-left: auto;
        }

        .chat-widget-message.bot {
            background-color: #f1f1f1;
            margin-right: auto;
        }

        .chat-widget-input {
            padding: 15px;
            border-top: 1px solid #eee;
            display: flex;
        }

        .chat-widget-input input {
            flex-grow: 1;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-right: 8px;
        }

        .chat-widget-input button {
            padding: 8px 16px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }

        .chat-widget-status {
            font-size: 12px;
            color: #666;
        }
    `;
    document.head.appendChild(style);

    // Create widget HTML
    const widgetHTML = `
        <div class="chat-widget-button">
            <svg viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
        </div>
        <div class="chat-widget-box">
            <div class="chat-widget-header">
                <span class="chat-widget-title">Chat with us</span>
                <span class="chat-widget-status">Connecting...</span>
            </div>
            <div class="chat-widget-messages">
                <!-- Messages will be inserted here -->
            </div>
            <div class="chat-widget-input">
                <input type="text" placeholder="Type a message...">
                <button>Send</button>
            </div>
        </div>
    `;

    // Create container and inject HTML
    const container = document.createElement('div');
    container.className = 'chat-widget-container';
    container.innerHTML = widgetHTML;
    document.body.appendChild(container);

    // Get DOM elements
    const button = container.querySelector('.chat-widget-button');
    const chatBox = container.querySelector('.chat-widget-box');
    const input = container.querySelector('input');
    const sendButton = container.querySelector('button');
    const messagesContainer = container.querySelector('.chat-widget-messages');
    const statusElement = container.querySelector('.chat-widget-status');

    function connectWebSocket() {
        ws = new WebSocket(config.serverUrl);

        ws.onopen = () => {
            statusElement.textContent = 'Connected';
            statusElement.style.color = '#4CAF50';
        };

        ws.onclose = () => {
            statusElement.textContent = 'Disconnected';
            statusElement.style.color = '#f44336';
            // Try to reconnect after 3 seconds
            setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            statusElement.textContent = 'Connection error';
            statusElement.style.color = '#f44336';
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                addMessage(message.content, message.sender);
            } catch (error) {
                console.error('Error processing message:', error);
            }
        };
    }

    // Toggle chat box
    button.addEventListener('click', () => {
        const isOpening = !chatBox.classList.contains('active');
        chatBox.classList.toggle('active');
        
        if (isOpening && !ws) {
            connectWebSocket();
        }
    });

    function addMessage(content, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = `chat-widget-message ${sender}`;
        messageElement.textContent = content;
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Handle sending messages
    function sendMessage() {
        const content = input.value.trim();
        if (content && ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'message',
                content: content
            }));
            input.value = '';
        }
    }

    // Send message on button click
    sendButton.addEventListener('click', sendMessage);

    // Send message on Enter key
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Expose configuration method
    window.ChatWidget = {
        configure: function(options) {
            Object.assign(config, options);
            // Apply configurations
            if (options.primaryColor) {
                const elements = container.querySelectorAll('.chat-widget-button, .chat-widget-header, .chat-widget-input button');
                elements.forEach(el => el.style.backgroundColor = options.primaryColor);
            }
            if (options.title) {
                container.querySelector('.chat-widget-title').textContent = options.title;
            }
        }
    };
})();