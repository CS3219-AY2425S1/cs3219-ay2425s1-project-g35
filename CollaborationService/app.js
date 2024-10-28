import express from 'express';
import { Server } from 'socket.io';
import http from 'http'; 
import cors from 'cors'; 
import queueService from './services/queueService.js';
import roomService from './services/roomService.js';
import collaborationController from './controllers/collaborationController.js';
import socket from './config/socket.js'; 

const app = express();
const port = 3002;
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', 
        methods: ['GET', 'POST']
    }
});

app.use(cors());
app.use(express.json());

socket.createSocket(io);
queueService.consumeMatchFound(collaborationController.handleMatchFound, io);

// Room creation endpoint for testing purposes
app.post('/create-room', (req, res) => {
    const { roomId, user1, user2, topic, difficulty } = req.body;

    // Use default or sample values for testing if not provided
    const room = roomService.createRoom(
        roomId, 
        user1 || 'testUser1', 
        user2 || 'testUser2', 
        topic || 'Array', 
        difficulty || 'Easy'
    );
    
    if (room) {
        console.log(`Room ${roomId} created for testing.`);
        res.status(201).json({ message: 'Room created successfully', room });
    } else {
        res.status(400).json({ message: 'Failed to create room' });
    }
});

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
