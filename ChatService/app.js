import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';
import socket from './config/socket.js';

const app = express();
const port = 3003;
const server = http.createServer(app);

const frontendURL = process.env.FRONTEND_URL || "http://localhost:8080";  
app.use(cors({
    origin: frontendURL,
    credentials: true
}));

const io = new Server(server, {
    cors: {
        origin: frontendURL, 
        methods: ['GET', 'POST'],
        credentials: true
    }
});

app.use(express.json());
socket.createSocket(io);

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

