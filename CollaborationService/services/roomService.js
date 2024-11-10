import createRedisConnection from '../config/redis.js';
import Room from '../models/room-model.js';

const redisClient = createRedisConnection();

async function createRoom(roomId, user1, user2, topic, difficulty) {
    let question;
    try {
        const response = await fetch(`http://question-service:3000/question/random?&difficulty=${difficulty}`, {
            method: 'GET',
        });

        const defaultQuestion = {
            "Question ID": 11,
            "Question Title": "Longest Common Subsequence",
            "Question Description": "Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0. A subsequence of a string is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters. For example, \"ace\" is a subsequence of \"abcde\". A common subsequence of two strings is a subsequence that is common to both strings.",
            "Question Categories": [
                topic
            ],
            "Link": "https://leetcode.com/problems/longest-common-subsequence/",
            "Question Complexity": difficulty
        };

        question = await response.json();
        
        if (!response.ok) {
            console.log(response);
            console.error("Failed to fetch question");
            question = defaultQuestion;
        }
        
    } catch (error) {
        console.error("Error fetching question:", error);
        return null;
    }
    
    const room = new Room(roomId, user1, user2, question);
    
    // Save room to Redis using the updated method names
    await redisClient.hSet(`room:${roomId}`, {
        users: JSON.stringify(room.users),
        question: JSON.stringify(room.question),
        documentContent: room.documentContent,
        language: room.language,
        cursors: JSON.stringify(room.cursors),
    });

    return room;
}

async function getRoom(roomId) {
    const roomData = await redisClient.hGetAll(`room:${roomId}`);
    
    if (!roomData || Object.keys(roomData).length === 0) {
        console.log(`Room data for ${roomId} is missing or empty.`);
        return null;
    }

    const room = new Room(
        roomId,
        JSON.parse(roomData.users)[0], // First user
        JSON.parse(roomData.users)[1], // Second user
        JSON.parse(roomData.question)
    );
    room.documentContent = roomData.documentContent;
    room.language = roomData.language;
    room.cursors = JSON.parse(roomData.cursors);

    return room;
}

async function updateContent(roomId, content) {
    await redisClient.hSet(`room:${roomId}`, 'documentContent', content); 
}

async function updateLanguage(roomId, language) {
    await redisClient.hSet(`room:${roomId}`, 'language', language); 
}

async function updateCursorPosition(roomId, userId, cursorPosition) {
    const roomData = await getRoom(roomId);
    if (roomData) {
        roomData.cursors[userId] = cursorPosition;
        await redisClient.hSet(`room:${roomId}`, 'cursors', JSON.stringify(roomData.cursors)); // Use hSet
    } else {
        console.error(`Room ${roomId} not found for updating cursor position`);
    }
}

export default {
    createRoom,
    getRoom,
    updateContent,
    updateLanguage,
    updateCursorPosition
};
