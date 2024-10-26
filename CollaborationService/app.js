// server.js
import express from 'express';
import http from 'http';
import { Server as SocketIoServer } from 'socket.io';
import { connectToDatabase } from './db.js';
import documentRoutes from './routes/documentRoutes.js';

const app = express();
const server = http.createServer(app);
const io = new SocketIoServer(server);

app.use(express.json());
app.use('/routes', documentRoutes);

// todo: update logic for real-time collaboration
io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('joinDocument', (docId) => {
        socket.join(docId);
        console.log(`User joined document ${docId}`);
    });

    socket.on('editDocument', async (data) => {
        const { docId, content } = data;
        socket.to(docId).emit('documentUpdate', { docId, content });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const startServer = async () => {
    await connectToDatabase();
    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

startServer();
