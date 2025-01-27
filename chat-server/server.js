// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Enable CORS for development
app.use(cors());

// Serve static files (like our widget)
app.use(express.static('public'));

// Store active connections
const clients = new Map();

// Simulate automated responses
const automatedResponses = [
    "Hello! How can I help you today?",
    "Thanks for your message. Let me check that for you.",
    "I understand your concern. Could you provide more details?",
    "I'm here to help! What specific information do you need?",
];

function getRandomResponse() {
    return automatedResponses[Math.floor(Math.random() * automatedResponses.length)];
}

wss.on('connection', (ws) => {
    const clientId = Date.now();
    clients.set(clientId, ws);

    console.log(`New client connected. Total clients: ${clients.size}`);

    // Send welcome message
    ws.send(JSON.stringify({
        type: 'message',
        content: "Welcome! How can we help you today?",
        sender: 'bot'
    }));

    ws.on('message', (message) => {
        try {
            const parsedMessage = JSON.parse(message);
            console.log('Received message:', parsedMessage);

            // Broadcast message to sender
            ws.send(JSON.stringify({
                type: 'message',
                content: parsedMessage.content,
                sender: 'user'
            }));

            // Simulate bot response after 1 second
            setTimeout(() => {
                ws.send(JSON.stringify({
                    type: 'message',
                    content: getRandomResponse(),
                    sender: 'bot'
                }));
            }, 1000);

        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        clients.delete(clientId);
        console.log(`Client disconnected. Total clients: ${clients.size}`);
    });

    // Handle errors
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});