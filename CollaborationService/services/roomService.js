import Room from '../models/room-model.js';

const rooms = {}; 

function createRoom(roomId, user1, user2, topic, difficulty) {
    // Sample hardcoded question
    const question = {
        "Question ID": 101,
        "Question Title": "Two Sum",
        "Question Description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        "Question Categories": ["Array", "Hash Table"],
        "Link": "https://leetcode.com/problems/two-sum/",
        "Question Complexity": "Easy"
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