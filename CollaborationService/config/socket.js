import roomService from '../services/roomService.js';
import clientInstance from '../models/client-model.js';
const { getRoom, updateCursorPosition, updateContent } = roomService;

function createSocket(io) {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        const userId = socket.handshake.query.userId;

        clientInstance.addClient(userId, socket.id);

        const question = {
            "Question ID": 101,
            "Question Title": "Two Sum",
            "Question Description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
            "Question Categories": ["Array", "Hash Table"],
            "Link": "https://leetcode.com/problems/two-sum/",
            "Question Complexity": "Easy"
        }

        io.to(socket.id).emit('collaboration_ready', {
            question: question
        });

        console.log(`User connected: ${userId}, socket ID: ${socket.id}`);

        socket.on('joinRoom', ({ roomId }) => {
            console.log(`User ${socket.id} attempting to join room: ${roomId}`);
            const room = getRoom(roomId);
            if (room) {
                socket.join(roomId);
                console.log(`User ${socket.id} joined room: ${roomId}`);
            } else {
                console.error(`Room ${roomId} not found for user ${socket.id}`);
                socket.emit('error', { message: 'Room not found' });
            }
        });

        socket.on('editDocument', ({ roomId, content }) => {
            console.log(`User ${socket.id} editing document in room: ${roomId}`);
            const room = getRoom(roomId);
            if (room && content) {
                updateContent(roomId, content);
                console.log(`Updated document content in room ${roomId}. Broadcasting to other users.`);
                socket.to(roomId).emit('documentUpdate', { content });
            } else {
                console.error(`Failed to update document for room ${roomId} by user ${socket.id}. Room or content may be missing.`);
            }
        });

        socket.on('updateCursor', ({ roomId, userId, cursorPosition }) => {
            console.log(`User ${socket.id} updating cursor position in room: ${roomId} for user ${userId}`);
            const room = getRoom(roomId);
            if (room && userId && cursorPosition) {
                updateCursorPosition(roomId, userId, cursorPosition);
                console.log(`Updated cursor position for user ${userId} in room ${roomId}. Broadcasting to other users.`);
                socket.to(roomId).emit('cursorUpdate', { userId, cursorPosition });
            } else {
                console.error(`Failed to update cursor for room ${roomId}. User ID or cursor position may be missing.`);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
}

export default { 
    createSocket 
};
