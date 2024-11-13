import roomService from '../services/roomService.js';
import clientInstance from '../models/client-model.js';
const { getRoom, updateCursorPosition, updateContent, updateLanguage } = roomService;

function createSocket(io) {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        const userId = socket.handshake.query.userId;
        console.log("userId after handshake", userId);

        clientInstance.addClient(userId, socket.id);

        socket.on('joinRoom', async ({ roomId }) => {
            console.log(`User ${socket.id} attempting to join room: ${roomId}`);
            const room = await getRoom(roomId);
            socket.join(roomId);
            console.log(`User ${socket.id} joined room: ${roomId}`);
            if (room) {
                console.log(`Room ${roomId} exists! Emitting load_room_content event to user ${socket.id}`);
                socket.emit('load_room_content', { 
                    question: room.question,
                    documentContent: room.documentContent,
                    cursors: room.cursors,
                });
            } else {
                console.error(`Room ${roomId} not found for user ${socket.id}`);
                socket.emit('error', { message: 'Room not found' });
            }
        });

        socket.on('editDocument', async ({ roomId, language, content }) => {
            console.log(`User ${socket.id} editing ${language} document in room: ${roomId}`);
            const room = await getRoom(roomId);
            if (room) {
                await updateContent(roomId, language, content);
                console.log(`Updated ${language} document content in room ${roomId}. Broadcasting to all users in the room.`);
                io.in(roomId).emit('documentUpdate', { content, language });
            } else {
                console.error(`Failed to update document for room ${roomId} by user ${socket.id}. Room or content may be missing.`);
            }
        });
        

        socket.on('editLanguage', async ({ roomId, language }) => {
            console.log(`User ${socket.id} changed language to ${language} in room: ${roomId}`);
            const room = await getRoom(roomId);
            if (room) {
                await updateLanguage(roomId, language);
                console.log(`Updated language in room ${roomId}. Broadcasting selected language and content to other users.`);
                const content = room.documentContent[language];
                socket.to(roomId).emit('languageUpdate', { language, content });
            } else {
                console.error(`Failed to update language for room ${roomId} by user ${socket.id}. Room or content may be missing.`);
            }
        });
        

        socket.on('updateCursor', async ({ roomId, userId, cursorPosition }) => {
            console.log(`User ${socket.id} updating cursor position in room: ${roomId} for user ${userId}`);
            const room = await getRoom(roomId);
            if (room && userId && cursorPosition) {
                await updateCursorPosition(roomId, userId, cursorPosition);
                console.log(`Updated cursor position for user ${userId} in room ${roomId}. Broadcasting to other users.`);
                socket.to(roomId).emit('cursorUpdate', { userId, cursorPosition });
            } else {
                console.error(`Failed to update cursor for room ${roomId}. User ID or cursor position may be missing.`);
            }
        });

        socket.on('custom_disconnect', async ({ roomId, username }, callback) => {
            try {
                const userId = await clientInstance.getUserIdBySocketId(socket.id);
        
                if (userId) {
                    await clientInstance.removeClient(userId);
                    console.log(`Removed client with userId: ${userId} after disconnect.`);
                } else {
                    console.error(`Could not find userId for disconnected socket: ${socket.id}`);
                }
        
                socket.to(roomId).emit('partner_disconnect', { username });
        
                // Acknowledge disconnection
                if (callback) callback();
            } catch (error) {
                console.error('Error handling custom disconnect:', error);
                if (callback) callback(error);
            }
        });
        
        // partner username event
        socket.on('first_username', ({ roomId, username }) => {
            console.log(`Received first_username event from user: ${username}`);
            socket.to(roomId).emit('first_username', { username });
        });

        socket.on('second_username', ({ roomId, username }) => {
            console.log(`Received second_username event from user: ${username}`);
            socket.to(roomId).emit('second_username', { username });
        });
    });
}

export default { 
    createSocket 
};