import roomService from '../services/roomService.js';
import clientInstance from '../models/client-model.js';

async function handleMatchFound(matchData, io) {
    const { roomId, user1_Id, user2_id, topic, difficulty } = matchData;
    const room = await roomService.createRoom(roomId, user1_Id, user2_id, topic, difficulty);

    const user1_socketId = clientInstance.getSocketId(user1_Id);
    const user2_sockerId = clientInstance.getSocketId(user2_id);
    
    io.to(user1_socketId).to(user2_sockerId).emit('collaboration_ready', {
        roomId: room.roomId,
        question: room.question,
    });

    console.log("Collaboration Ready sent for room ", room.roomId);
    console.log("sent to ", user1_socketId, user2_sockerId);
};

export default {
    handleMatchFound
};
