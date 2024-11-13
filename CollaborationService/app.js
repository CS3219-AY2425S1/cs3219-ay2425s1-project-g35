import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';
import queueService from './services/queueService.js';
import collaborationController from './controllers/collaborationController.js';
import socket from './config/socket.js';

const frontendURL = process.env.FRONTEND_URL || "http://localhost:8080";
const app = express();
const port = 3002;
const server = http.createServer(app);

const io = process.env.FRONTEND_URL
    ? new Server(server, {
        cors: {
            origin: frontendURL,  
            methods: ['GET', 'POST'],
            credentials: true     
        }
      })
    : new Server(server);

if (process.env.FRONTEND_URL) {
    app.use(cors({
        origin: frontendURL, 
        credentials: true     
    }));
}

app.use(express.json());

// Initialize socket and queue services
socket.createSocket(io);
queueService.consumeMatchFound(collaborationController.handleMatchFound, io);

// Start server
server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
