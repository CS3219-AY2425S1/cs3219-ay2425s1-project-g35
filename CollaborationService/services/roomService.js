import Room from '../models/room-model.js';

const rooms = {}; 

async function createRoom(roomId, user1, user2, topic, difficulty) {
    let question;
    try {
        const response = await fetch(`http://question-service:3000/question/random?topic=${topic}&difficulty=${difficulty}`, {
            method: 'GET',
        });
        
        if (!response.ok) {
            console.log(response);
            throw new Error("Failed to fetch question");
        }
        
        question = await response.json();
    } catch (error) {
        console.error("Error fetching question:", error);
        return null;
    }
    
    rooms[roomId] = new Room(roomId, user1, user2, question);
    return rooms[roomId];
}

function getRoom(roomId) {
    return rooms[roomId];
}

function updateContent(roomId, content) {
    rooms[roomId].updateContent(content);
}

function updateCursorPosition(roomId, userId, cursorPosition) {
    rooms[roomId].updateCursorPosition(userId, cursorPosition);
}

export default {
    createRoom,
    getRoom,
    updateContent,
    updateCursorPosition
}