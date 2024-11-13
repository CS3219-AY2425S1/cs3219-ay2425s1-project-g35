import createRedisConnection from '../config/redis.js';
import Room from '../models/room-model.js';

const redisClient = createRedisConnection();

// Redis storage for rooms and messages
async function createRoom(roomId, user1, user2) {
    const roomKey = `room:${roomId}`;
    console.log(`Checking if room exists: ${roomKey}`);

    const roomExists = await redisClient.exists(roomKey); // Check if room already exists

    if (roomExists) {
        console.log(`Room ${roomId} exists. Fetching room data from Redis.`);
        const roomData = await redisClient.hGetAll(roomKey);
        console.log(`Fetched room data:`, roomData);

        // Fetch messages from Redis list
        const messagesKey = `messages:${roomId}`;
        const messages = await redisClient.lRange(messagesKey, 0, -1); // Get all messages
        console.log(`Fetched messages:`, messages);

        // Create Room object and return it with messages
        const room = new Room(roomData.roomId, roomData.user1, roomData.user2);
        room.messages = messages.map(msg => JSON.parse(msg)); // Parse each message from JSON
        return room;
    }

    // Room does not exist, create new room in Redis
    console.log(`Room ${roomId} does not exist. Creating new room.`);
    const newRoom = new Room(roomId, user1, user2);
    console.log(`Setting new room data in Redis:`, {
        roomId: newRoom.roomId,
        user1: newRoom.users[0],
        user2: newRoom.users[1]
    });

    await redisClient.hSet(roomKey, {
        roomId: newRoom.roomId,
        user1: newRoom.users[0],
        user2: newRoom.users[1]
    });
    console.log(`Room ${roomId} created and saved in Redis.`);
    return newRoom;
}

async function getRoom(roomId) {
    const roomKey = `room:${roomId}`;
    const messagesKey = `messages:${roomId}`; // Separate key for messages

    console.log(`Fetching room data for roomId: ${roomId} from Redis`);

    // Fetch the room data from the hash
    const roomData = await redisClient.hGetAll(roomKey);
    if (Object.keys(roomData).length === 0) {
        console.log(`Room ${roomId} not found in Redis.`);
        return null; // Room not found
    }

    console.log(`Room ${roomId} data fetched from Redis:`, roomData);

    // Fetch messages from the list
    const messages = await redisClient.lRange(messagesKey, 0, -1); // Retrieve all messages
    console.log(`Fetched messages:`, messages);

    // Create room object and include messages
    const room = new Room(roomData.roomId, roomData.user1, roomData.user2);
    room.messages = messages.map(msg => JSON.parse(msg)); // Parse messages from JSON

    return room;
}

async function addMessage(roomId, msg, username) {
    const roomKey = `room:${roomId}`;
    console.log(`Fetching room state for roomId: ${roomId}`);

    // Fetch the current room state
    const roomData = await redisClient.hGetAll(roomKey);
    if (Object.keys(roomData).length === 0) {
        console.log(`Room ${roomId} not found in Redis.`);
        return null; // Room not found
    }

    const room = new Room(roomData.roomId, roomData.user1, roomData.user2);
    console.log(`Adding message to room ${roomId}:`, { msg, username });
    const message = room.addMessage(msg, username);

    // Save the updated messages array to Redis
    console.log(`Saving new message to Redis list for room ${roomId}`);
    await redisClient.rPush(`messages:${roomId}`, JSON.stringify(message));
    console.log(`Message saved to Redis:`, message);

    return message;
}

// Exporting the functions
export default {
    createRoom,
    getRoom,
    addMessage,
};
