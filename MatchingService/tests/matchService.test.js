// matchService.test.js
import matchService from '../services/matchService';
import QueueModel from '../models/queue-model';
import queueService from '../services/queueService';

// Mock dependencies
jest.mock('../models/queue-model');
jest.mock('../services/queueService');
jest.mock('../config/rabbitmq');
jest.mock('../config/redis.js', () => {
    const redisMock = require('redis-mock');
    return {
        __esModule: true,
        default: () => redisMock.createClient(),
    };
});
describe('Match Service', () => {
    let mockIO;
    let consumeCallback;

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        // Mock IO object
        mockIO = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn()
        };

        // Setup default mock implementations
        QueueModel.addRequest.mockResolvedValue(undefined);
        QueueModel.removeRequest.mockResolvedValue(undefined);
        QueueModel.getQueue.mockResolvedValue([]);
        queueService.publishMatchRequest.mockResolvedValue(undefined);
        queueService.publishMatchFound.mockResolvedValue(undefined);

        // Capture the consume callback
        queueService.consumeMatchRequests.mockImplementation(callback => {
            consumeCallback = callback;
            return Promise.resolve();
        });
    });

    describe('addMatchRequest', () => {
        const mockRequestData = {
            userId: 'user1',
            topic: 'JavaScript',
            difficulty: 'Medium',
            socketId: 'socket1'
        };

        it('should successfully add a match request', async () => {
            await matchService.addMatchRequest(
                mockRequestData.userId,
                mockRequestData.topic,
                mockRequestData.difficulty,
                mockRequestData.socketId
            );

            expect(QueueModel.addRequest).toHaveBeenCalledWith(
                mockRequestData.userId,
                expect.objectContaining({
                    topic: mockRequestData.topic,
                    difficulty: mockRequestData.difficulty,
                    socketId: mockRequestData.socketId
                })
            );
            expect(queueService.publishMatchRequest).toHaveBeenCalledWith(mockRequestData);
        });

        it('should throw error if adding request fails', async () => {
            const errorMessage = 'Failed to add request';
            QueueModel.addRequest.mockRejectedValue(new Error(errorMessage));

            await expect(
                matchService.addMatchRequest(
                    mockRequestData.userId,
                    mockRequestData.topic,
                    mockRequestData.difficulty,
                    mockRequestData.socketId
                )
            ).rejects.toThrow(errorMessage);
        });
    });

    describe('cancelMatchRequest', () => {
        it('should successfully cancel a match request', async () => {
            const userId = 'user1';
            await matchService.cancelMatchRequest(userId);

            expect(QueueModel.removeRequest).toHaveBeenCalledWith(userId);
        });
    });

    describe('processMatchQueue', () => {
        const mockUser1 = {
            userId: 'user1',
            topic: 'JavaScript',
            difficulty: 'Medium',
            socketId: 'socket1'
        };

        const mockUser2 = {
            userId: 'user2',
            topic: 'JavaScript',
            difficulty: 'Medium',
            socketId: 'socket2'
        };

        it('should match users with same topic and difficulty', async () => {
            // Initialize queue processing
            await matchService.processMatchQueue(mockIO);

            // Setup queue state
            QueueModel.getQueue.mockResolvedValue([mockUser2]);

            // Simulate receiving a message
            await consumeCallback(mockUser1);

            // Verify matching occurred
            expect(QueueModel.removeRequest).toHaveBeenCalledWith(mockUser1.userId);
            expect(QueueModel.removeRequest).toHaveBeenCalledWith(mockUser2.userId);

            // Verify socket emissions
            expect(mockIO.to).toHaveBeenCalledWith(mockUser1.socketId);
            expect(mockIO.to).toHaveBeenCalledWith(mockUser2.socketId);
            expect(mockIO.emit).toHaveBeenCalledWith('matched', expect.objectContaining({
                user1_Id: mockUser1.userId,
                user2_id: mockUser2.userId,
                topic: mockUser1.topic,
                difficulty: mockUser1.difficulty,
                roomId: expect.any(String)
            }));
        });

        it('should not match users with different topics', async () => {
            // Initialize queue processing
            await matchService.processMatchQueue(mockIO);

            const differentTopicUser = { ...mockUser2, topic: 'Python' };
            QueueModel.getQueue.mockResolvedValue([differentTopicUser]);

            // Simulate receiving a message
            await consumeCallback(mockUser1);

            // Verify no matching occurred
            expect(QueueModel.removeRequest).not.toHaveBeenCalled();
            expect(mockIO.emit).not.toHaveBeenCalled();
        });

        it('should match users with different difficulties preferring exact matches', async () => {
            // Initialize queue processing
            await matchService.processMatchQueue(mockIO);

            const hardDifficultyUser = { ...mockUser2, difficulty: 'Hard' };
            QueueModel.getQueue.mockResolvedValue([hardDifficultyUser]);

            // Simulate receiving a message
            await consumeCallback(mockUser1);

            // Verify matching occurred with adjusted difficulty
            expect(QueueModel.removeRequest).toHaveBeenCalledWith(mockUser1.userId);
            expect(QueueModel.removeRequest).toHaveBeenCalledWith(hardDifficultyUser.userId);
            expect(mockIO.emit).toHaveBeenCalledWith('matched', expect.objectContaining({
                difficulty: 'Medium' // Should use the lower difficulty level
            }));
        });

        it('should handle empty queue', async () => {
            // Initialize queue processing
            await matchService.processMatchQueue(mockIO);

            QueueModel.getQueue.mockResolvedValue([]);

            // Simulate receiving a message
            await consumeCallback(mockUser1);

            // Verify no matching occurred
            expect(QueueModel.removeRequest).not.toHaveBeenCalled();
            expect(mockIO.emit).not.toHaveBeenCalled();
        });
    });
});