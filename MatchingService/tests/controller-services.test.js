import matchService from '../services/matchService';
import QueueModel from '../models/queue-model';
import queueService from '../services/queueService';

jest.mock('../models/queue-model.js');
jest.mock('../services/queueService.js');
jest.mock('../config/redis.js', () => {
    const redisMock = require('redis-mock');
    return {
        __esModule: true,
        default: () => redisMock.createClient(),
    };
});
test('should add match request to Redis and publish to RabbitMQ', async () => {
    QueueModel.addRequest.mockResolvedValueOnce();
    queueService.publishMatchRequest.mockResolvedValueOnce();

    await matchService.addMatchRequest('user1', 'Math', 'Medium', 'socket1');
    expect(QueueModel.addRequest).toHaveBeenCalledWith('user1', expect.any(Object));
    expect(queueService.publishMatchRequest).toHaveBeenCalled();
});

test('should throw error if request fails', async () => {
    QueueModel.addRequest.mockRejectedValueOnce(new Error('Redis error'));
    await expect(matchService.addMatchRequest('user1', 'Math', 'Medium', 'socket1')).rejects.toThrow('Redis error');
});
