import roomService from '../services/roomService.js';

function handleMatchFound(matchData, io) {
    const { roomId, user1_Id, user2_id, topic, difficulty } = matchData;
    const room = roomService.createRoom(roomId, user1_Id, user2_id, topic, difficulty);
    
    io.to(roomId).emit('collaboration_ready', {
        roomId: room.roomId,
        question: room.question,
    });
};

export default {
    handleMatchFound
};
