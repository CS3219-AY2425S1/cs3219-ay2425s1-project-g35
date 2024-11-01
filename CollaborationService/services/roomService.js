import Room from '../models/room-model.js';

const rooms = {}; 

async function createRoom(roomId, user1, user2, topic, difficulty) {
    let question;
    try {
        const response = await fetch(`http://question-service:3000/question/random?topic=${topic}&difficulty=${difficulty}`, {
            method: 'GET',
        });

        const defaultQuestion = {
            "Question ID": 11,
            "Question Title": "Longest Common Subsequence",
            "Question Description": "Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0. A subsequence of a string is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters. For example, \"ace\" is a subsequence of \"abcde\". A common subsequence of two strings is a subsequence that is common to both strings.",
            "Question Categories": [
                "Strings",
                topic
            ],
            "Link": "https://leetcode.com/problems/longest-common-subsequence/",
            "Question Complexity": difficulty
        }
        
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