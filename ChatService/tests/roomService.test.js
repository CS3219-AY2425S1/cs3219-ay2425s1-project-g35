import roomService from '../services/roomService.js';
import Room from '../models/room-model.js';

jest.mock('../config/redis.js', () => {
    const redisMock = require('redis-mock'); // Import inside the mock
    const redisMockClient = redisMock.createClient();
    redisMockClient.connect = jest.fn().mockResolvedValue(redisMockClient);
    redisMockClient.exists = jest.fn();
    redisMockClient.hGetAll = jest.fn();
    redisMockClient.lRange = jest.fn();
    redisMockClient.hSet = jest.fn();
    redisMockClient.rPush = jest.fn();
    return jest.fn(() => redisMockClient); // Return the mock client
});

describe('Room Service', () => {
    const mockRoomId = 'room1';
    const mockUser1 = 'user1';
    const mockUser2 = 'user2';
    const mockMessage = { content: 'Hello', senderUsername: 'user1', timestamp: new Date().toISOString() };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should create a new room if it does not exist', async () => {
        const redisClient = require('../config/redis.js')();
        redisClient.exists.mockResolvedValue(0);
        redisClient.hSet.mockResolvedValue();

        const room = await roomService.createRoom(mockRoomId, mockUser1, mockUser2);

        expect(redisClient.exists).toHaveBeenCalledWith(`room:${mockRoomId}`);
        expect(redisClient.hSet).toHaveBeenCalledWith(`room:${mockRoomId}`, {
            roomId: mockRoomId,
            user1: mockUser1,
            user2: mockUser2,
        });
        expect(room).toBeInstanceOf(Room);
        expect(room.users).toEqual([mockUser1, mockUser2]);
    });

    test('should fetch an existing room with messages', async () => {
        const redisClient = require('../config/redis.js')();
        redisClient.exists.mockResolvedValue(1);
        redisClient.hGetAll.mockResolvedValue({
            roomId: mockRoomId,
            user1: mockUser1,
            user2: mockUser2,
        });
        redisClient.lRange.mockResolvedValue([JSON.stringify(mockMessage)]);

        const room = await roomService.createRoom(mockRoomId, mockUser1, mockUser2);

        expect(redisClient.exists).toHaveBeenCalledWith(`room:${mockRoomId}`);
        expect(redisClient.hGetAll).toHaveBeenCalledWith(`room:${mockRoomId}`);
        expect(redisClient.lRange).toHaveBeenCalledWith(`messages:${mockRoomId}`, 0, -1);
        expect(room.messages).toEqual([mockMessage]);
    });

    test('should add a message to an existing room', async () => {
        const redisClient = require('../config/redis.js')();
        redisClient.hGetAll.mockResolvedValue({
            roomId: mockRoomId,
            user1: mockUser1,
            user2: mockUser2,
        });
        redisClient.rPush.mockResolvedValue();

        const message = await roomService.addMessage(mockRoomId, mockMessage.content, mockMessage.senderUsername);

        expect(redisClient.hGetAll).toHaveBeenCalledWith(`room:${mockRoomId}`);
        expect(redisClient.rPush).toHaveBeenCalledWith(
            `messages:${mockRoomId}`,
            JSON.stringify(message)
        );
        expect(message.content).toBe(mockMessage.content);
        expect(message.senderUsername).toBe(mockMessage.senderUsername);
    });
});
