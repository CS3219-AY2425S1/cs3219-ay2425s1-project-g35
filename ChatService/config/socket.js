import roomService from '../services/roomService.js';
const { createRoom, getRoom, addMessage } = roomService;

async function createSocket(io) {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        const userId = socket.handshake.query.userId;

        socket.on('joinRoom', async ({ roomId }) => {
            console.log(`User ${socket.id} attempting to join room: ${roomId}`);
            socket.join(roomId);
            
            // Get the number of clients currently in the room
            const clients = io.sockets.adapter.rooms.get(roomId)?.size || 0;
        
            // If there are now two clients, create the room and broadcast the content to all clients in the room
            if (clients > 1) {
                const room = await createRoom(roomId, userId, userId); // Assuming you pass the user IDs here
                
                // Broadcast to everyone in the room including the joining client
                io.to(roomId).emit('load_room_content', { 
                    messages: room.messages,
                });
            } else {
                const room = await getRoom(roomId); // Await for the room data to be retrieved
                if (room) {
                    // If the room exists, broadcast the content to the joining client
                    socket.emit('load_room_content', { 
                        messages: room.messages,
                    });
                } else {
                    console.error(`Room ${roomId} does not exist.`);
                }
            }
        });

        socket.on('chat message', async ({ roomId, msg, username }) => {
            console.log(`User ${socket.id} sending message in room: ${roomId}`);
            const room = await getRoom(roomId); // Await for the room data to be retrieved

            if (room) {
                const newMessage = await addMessage(roomId, msg, username); // Ensure the message is added asynchronously
                console.log(`Updated chat content in room ${roomId}. Broadcasting to other users.`);
                
                // Emit the updated message to the room
                socket.to(roomId).emit('chat message', { newMessage });
                // Emit to the client who sent the message
                socket.emit('chat message', { newMessage });
            } else {
                console.error(`Failed to update chat for room ${roomId} by user ${socket.id}. Room or content may be missing.`);
            }
        });
    });
}

export default { 
    createSocket 
};
