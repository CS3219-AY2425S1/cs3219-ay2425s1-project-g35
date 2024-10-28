import roomService from '../services/roomService.js';
import clientInstance from '../models/client-model.js';

function handleMatchFound(matchData, io) {
    const { roomId, user1_Id, user2_id, topic, difficulty } = matchData;
    const room = roomService.createRoom(roomId, user1_Id, user2_id, topic, difficulty);

    // const user1_socketId = clientInstance.getSocketId(user1_Id);
    // const user2_sockerId = clientInstance.getSocketId(user2_id);
    
    // io.to(user1_socketId).to(user2_sockerId).emit('collaboration_ready', {
    //     roomId: room.roomId,
    //     question: room.question,
    // });
};

export default {
    handleMatchFound
};
