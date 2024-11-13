// __tests__/roomService.tests.js
import { jest } from '@jest/globals';
import roomService from '../services/roomService.js';
import Room from '../models/room-model.js';

// Mock Redis client
jest.mock('../config/redis.js', () => {
    return jest.fn().mockImplementation(() => ({
        hSet: jest.fn().mockResolvedValue(true),
        hGetAll: jest.fn().mockImplementation((key) => {
            if (key === 'room:nonexistent') {
                return Promise.resolve({});
            }
            return Promise.resolve({
                users: JSON.stringify(['user1', 'user2']),
                question: JSON.stringify({
                    'Question ID': 1,
                    'Question Title': 'Test Question'
                }),
                documentContent: 'test content',
                language: 'javascript',
                cursors: JSON.stringify({ user1: { line: 1, ch: 1 } })
            });
        })
    }));
});

// Mock fetch
global.fetch = jest.fn();

describe('Room Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createRoom', () => {
        it('should create a room successfully', async () => {
            // Mock successful API response
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    'Question ID': 1,
                    'Question Title': 'Test Question'
                })
            });

            const room = await roomService.createRoom(
                'room1',
                'user1',
                'user2',
                'algorithms',
                'easy'
            );

            expect(room).toBeInstanceOf(Room);
            expect(room.roomId).toBe('room1');
        });

        it('should use default question when API fails', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({})
            });

            const room = await roomService.createRoom(
                'room1',
                'user1',
                'user2',
                'algorithms',
                'easy'
            );

            expect(room.question['Question Title']).toBe('Longest Common Subsequence');
        });
    });

    describe('getRoom', () => {
        it('should retrieve room data successfully', async () => {
            const room = await roomService.getRoom('room1');

            expect(room).toBeInstanceOf(Room);
            expect(room.documentContent).toBe('test content');
            expect(room.language).toBe('javascript');
        });

        it('should return null for non-existent room', async () => {
            const redisClient = require('../config/redis.js')();
            redisClient.hGetAll.mockResolvedValueOnce({});

            const room = await roomService.getRoom('nonexistent');
            expect(room).toBeNull();
        });
    });

});

// __tests__/queueService.test.js
import queueService from '../services/queueService.js';

// Create mock channel with jest.fn() for all methods
const mockChannel = {
    assertQueue: jest.fn().mockResolvedValue(true),
    consume: jest.fn().mockImplementation((queue, callback) => {
        // Store the callback for testing
        global.__queueCallback = callback;
        return Promise.resolve();
    }),
    ack: jest.fn(),
    sendToQueue: jest.fn()
};

// Mock RabbitMQ connection
jest.mock('../config/rabbitmq.js', () => {
    return jest.fn().mockImplementation(() => ({
        channel: mockChannel
    }));
});

describe('Queue Service', () => {
    let mockIo;

    beforeEach(() => {
        jest.clearAllMocks();
        mockIo = {
            emit: jest.fn()
        };
    });

    describe('consumeMatchFound', () => {
        it('should process messages correctly', async () => {
            const mockProcessMessage = jest.fn();
            const testMessage = { userId: '123', matchId: '456' };

            await queueService.consumeMatchFound(mockProcessMessage, mockIo);

            // Verify queue assertion
            expect(mockChannel.assertQueue).toHaveBeenCalledWith(
                'match_found',
                { durable: false }
            );

            // Simulate receiving a message
            await global.__queueCallback({
                content: Buffer.from(JSON.stringify(testMessage))
            });

            expect(mockProcessMessage).toHaveBeenCalledWith(testMessage, mockIo);
            expect(mockChannel.ack).toHaveBeenCalled();
        });

        it('should handle processing errors', async () => {
            const mockProcessMessage = jest.fn().mockRejectedValue(new Error('Process error'));

            await queueService.consumeMatchFound(mockProcessMessage, mockIo);

            await expect(
                global.__queueCallback({
                    content: Buffer.from(JSON.stringify({}))
                })
            ).rejects.toThrow('Error processing message');
        });
    });

    describe('publishCollaboration', () => {
        it('should publish messages to collaboration queue', async () => {
            const testMessage = { type: 'code_change', content: 'test' };
            await queueService.publishCollaboration(testMessage);

            // Verify queue assertion
            expect(mockChannel.assertQueue).toHaveBeenCalledWith(
                'collaboration',
                { durable: false }
            );

            // Verify message publishing
            expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
                'collaboration',
                Buffer.from(JSON.stringify(testMessage))
            );
        });
    });
});