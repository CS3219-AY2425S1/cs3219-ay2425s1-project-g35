import express from 'express';
import { Server } from 'socket.io';
import http from 'http'; 
import cors from 'cors'; 
import socket from './config/socket.js'; 

const app = express();
const port = 3003;
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

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});