// matchController.test.js
import matchController from '../controllers/matchController';
import matchService from '../services/matchService';
import QueueModel from '../models/queue-model';
import jwt from 'jsonwebtoken';

jest.mock('../services/matchService');
jest.mock('../models/queue-model');
jest.mock('jsonwebtoken');
jest.mock('../config/redis.js', () => {
    const redisMock = require('redis-mock');
    return {
        __esModule: true,
        default: () => redisMock.createClient(),
    };
});
describe('Match Controller', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        jest.clearAllMocks();

        mockReq = {
            body: {},
            cookies: {
                accessToken: 'mock-token'
            }
        };

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Default mock implementations
        jwt.verify.mockReturnValue(true);
        QueueModel.isUserInQueue.mockResolvedValue(false);
        matchService.addMatchRequest.mockResolvedValue(undefined);
        matchService.cancelMatchRequest.mockResolvedValue(undefined);
    });

    describe('handleMatchRequest', () => {
        const mockMatchRequest = {
            userId: 'user1',
            topic: 'JavaScript',
            difficulty: 'Medium',
            socketId: 'socket1'
        };

        it('should handle valid match request', async () => {
            mockReq.body = mockMatchRequest;

            await matchController.handleMatchRequest(mockReq, mockRes);

            expect(matchService.addMatchRequest).toHaveBeenCalledWith(
                mockMatchRequest.userId,
                mockMatchRequest.topic,
                mockMatchRequest.difficulty,
                mockMatchRequest.socketId
            );
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Match request sent',
                userId: mockMatchRequest.userId
            });
        });

        it('should reject request if user is already in queue', async () => {
            mockReq.body = mockMatchRequest;
            QueueModel.isUserInQueue.mockResolvedValue(true);

            await matchController.handleMatchRequest(mockReq, mockRes);

            expect(matchService.addMatchRequest).not.toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'User is already in the queue'
            });
        });

        it('should reject request if authentication fails', async () => {
            // Mock console.error to ignore error logs
            const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});


            mockReq.body = mockMatchRequest;
            jwt.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            await matchController.handleMatchRequest(mockReq, mockRes);

            expect(matchService.addMatchRequest).not.toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Authentication failed'
            });
            // Restore console.error after the test
            consoleErrorMock.mockRestore();
        });
    });

    describe('cancelRequest', () => {
        const mockCancelRequest = {
            userId: 'user1'
        };

        it('should handle valid cancel request', async () => {
            mockReq.body = mockCancelRequest;
            QueueModel.isUserInQueue.mockResolvedValue(true);

            await matchController.cancelRequest(mockReq, mockRes);

            expect(matchService.cancelMatchRequest).toHaveBeenCalledWith(mockCancelRequest.userId);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Match request cancelled',
                userId: mockCancelRequest.userId
            });
        });

        it('should reject if user is not in queue', async () => {
            mockReq.body = mockCancelRequest;
            QueueModel.isUserInQueue.mockResolvedValue(false);

            await matchController.cancelRequest(mockReq, mockRes);

            expect(matchService.cancelMatchRequest).not.toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'User is not in the queue, no request to cancel'
            });
        });
    });
});