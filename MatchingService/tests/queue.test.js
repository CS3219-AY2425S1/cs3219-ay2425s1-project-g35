// queueService.test.js
import queueService from '../services/queueService';
import connectRabbitMQ from '../config/rabbitmq';
import QueueModel from '../models/queue-model';

jest.mock('../config/rabbitmq');
jest.mock('../models/queue-model');
jest.mock('../config/redis.js', () => {
    const redisMock = require('redis-mock');
    return {
        __esModule: true,
        default: () => redisMock.createClient(),
    };
});
describe('Queue Service', () => {
    let mockChannel;

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock RabbitMQ channel
        mockChannel = {
            assertQueue: jest.fn(),
            sendToQueue: jest.fn(),
            consume: jest.fn(),
            ack: jest.fn()
        };

        connectRabbitMQ.mockResolvedValue({ channel: mockChannel });
        QueueModel.isUserInQueue.mockResolvedValue(true);
    });

    describe('publishMatchRequest', () => {
        const mockMessage = {
            userId: 'user1',
            topic: 'JavaScript',
            difficulty: 'Medium',
            socketId: 'socket1'
        };

        it('should publish message to match requests queue', async () => {
            await queueService.publishMatchRequest(mockMessage);

            expect(mockChannel.assertQueue).toHaveBeenCalledWith('match_requests', { durable: false });
            expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
                'match_requests',
                Buffer.from(JSON.stringify(mockMessage))
            );
        });
    });

    describe('consumeMatchRequests', () => {
        it('should process valid messages from queue', async () => {
            const messageData = {
                userId: 'user1',
                topic: 'JavaScript',
                difficulty: 'Medium',
                socketId: 'socket1'
            };

            const processMessage = jest.fn().mockResolvedValue(undefined);
            let consumeCallback;

            // Capture the consume callback
            mockChannel.consume.mockImplementation((queue, callback) => {
                consumeCallback = callback;
                return Promise.resolve();
            });

            // Start consuming
            const consumePromise = queueService.consumeMatchRequests(processMessage);

            // Wait for consume setup
            await consumePromise;

            // Simulate message receipt
            const mockMsg = {
                content: Buffer.from(JSON.stringify(messageData))
            };

            // Execute the callback and wait for it to complete
            await consumeCallback(mockMsg);

            // Verify queue assertion
            expect(mockChannel.assertQueue).toHaveBeenCalledWith('match_requests', { durable: false });

            // Verify message processing
            expect(processMessage).toHaveBeenCalledWith(messageData);

            // Verify message acknowledgment
            expect(mockChannel.ack).toHaveBeenCalledWith(mockMsg);
        });

        it('should not process message if user is not in queue', async () => {
            const messageData = {
                userId: 'user1',
                topic: 'JavaScript',
                difficulty: 'Medium',
                socketId: 'socket1'
            };

            const processMessage = jest.fn();
            QueueModel.isUserInQueue.mockResolvedValue(false);

            mockChannel.consume.mockImplementation((queue, callback) => {
                callback({
                    content: Buffer.from(JSON.stringify(messageData))
                });
                return Promise.resolve();
            });

            await queueService.consumeMatchRequests(processMessage);

            expect(processMessage).not.toHaveBeenCalled();
            expect(mockChannel.ack).toHaveBeenCalledWith(
                expect.objectContaining({
                    content: expect.any(Buffer)
                })
            );
        });

        it('should handle null messages', async () => {
            const processMessage = jest.fn();

            mockChannel.consume.mockImplementation((queue, callback) => {
                callback(null);
                return Promise.resolve();
            });

            await queueService.consumeMatchRequests(processMessage);

            expect(processMessage).not.toHaveBeenCalled();
            expect(mockChannel.ack).not.toHaveBeenCalled();
        });
    });

});