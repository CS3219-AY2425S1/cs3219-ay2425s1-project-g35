// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { connectToDatabase } = require('./db');
const documentRoutes = require('./routes/documentRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());
app.use('/routes', documentRoutes);


// todo: update logic for real time collaboration
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
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

startServer();
