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
    " Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus vel sollicitudin nulla. Integer finibus elit erat, nec egestas orci tempus eu. Mauris nec felis ornare, sodales sem eget, pretium lacus. Integer in justo auctor dui lacinia euismod tempus vel metus. Maecenas nec tristique quam. Sed aliquam nunc et mauris facilisis suscipit a ac ex. Nunc sed erat malesuada, finibus turpis sit amet, hendrerit metus. Maecenas interdum mattis turpis, vitae tempus arcu consequat vel. Proin lacus felis, accumsan quis sapien ut, sollicitudin fringilla turpis. Morbi elementum ullamcorper odio nec fermentum. Sed id magna ut lectus vestibulum suscipit eleifend sed eros. Nunc non tortor eget mauris tincidunt vulputate sed in nunc. Curabitur consectetur auctor mi, vitae scelerisque nisl accumsan non. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Praesent ut ligula ipsum. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Ut varius posuere dolor. Ut feugiat molestie lacinia. Curabitur ligula neque, rutrum id dapibus vel, dapibus et tellus. Sed vitae diam ac augue mollis tincidunt. Aenean at leo in ipsum dignissim eleifend quis ac libero. Curabitur non ante at risus feugiat laoreet. "
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

    const randomDelay = Math.floor(Math.random() * (7000 - 2000 + 1)) + 2000;
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
            }, randomDelay);

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