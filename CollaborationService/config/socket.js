import roomService from '../services/roomService.js';
import clientInstance from '../models/client-model.js';
const { getRoom, updateCursorPosition, updateContent } = roomService;

function createSocket(io) {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        const userId = socket.handshake.query.userId;

        clientInstance.addClient(userId, socket.id);

        socket.on('joinRoom', ({ roomId }) => {
            console.log(`User ${socket.id} attempting to join room: ${roomId}`);
            const room = getRoom(roomId);
            if (room) {
                socket.join(roomId);
                console.log(`User ${socket.id} joined room: ${roomId}`);

                socket.emit('load_room_content', { 
                    question: room.question,
                    documentContent: room.documentContent,
                    cursors: room.cursors
                });
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

        socket.on('custom_disconnect', ({ roomId, username }) => {
            console.log('User disconnected:', socket.id);

            const userId = clientInstance.getUserIdBySocketId(socket.id);

            if (userId) {
                clientInstance.removeClient(userId);
                console.log(`Removed client with userId: ${userId} after disconnect.`);
            } else {
                console.error(`Could not find userId for disconnected socket: ${socket.id}`);
            }

            socket.to(roomId).emit('partner_disconnect', { username });
        });
        // partner username event
        socket.on('first_username', ({ roomId, username }) => {
            console.log(`Received first_username event from user: ${username}`);
            socket.to(roomId).emit('first_username', { username });
        });

        socket.on('second_username', ({ roomId, username }) => {
            console.log(`Received first_username event from user: ${username}`);
            socket.to(roomId).emit('second_username', { username });
        });
    });
}

export default { 
    createSocket 
};
