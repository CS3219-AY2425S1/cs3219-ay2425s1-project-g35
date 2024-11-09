import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';
import socket from './config/socket.js';

const app = express();
const port = 3003;
const server = http.createServer(app);
const frontendURL = process.env.FRONTEND_URL || "http://localhost:8080";  

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
socket.createSocket(io);

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

