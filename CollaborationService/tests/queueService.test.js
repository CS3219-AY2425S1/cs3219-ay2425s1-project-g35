import queueServices from '../services/queueService';
import connectRabbitMQ from '../config/rabbitmq';

// Mock the console to suppress logs during tests
global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
};

// Mock the amqplib connection
jest.mock('../config/rabbitmq', () => {
    return jest.fn().mockImplementation(() => ({
        channel: {
            assertQueue: jest.fn().mockResolvedValue({}),
            consume: jest.fn(),
            ack: jest.fn(),
            sendToQueue: jest.fn()
        },
        connection: {
            close: jest.fn()
        }
    }));
});

describe('Queue Services', () => {
    let mockChannel;
    let mockIo;

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();

        // Setup mock channel from the connection
        mockChannel = {
            assertQueue: jest.fn().mockResolvedValue({}),
            consume: jest.fn(),
            ack: jest.fn(),
            sendToQueue: jest.fn().mockResolvedValue()
        };

        connectRabbitMQ.mockImplementation(() => ({
            channel: mockChannel,
            connection: { close: jest.fn() }
        }));

        // Setup mock Socket.IO instance
        mockIo = {
            emit: jest.fn()
        };
    });

    describe('consumeMatchFound', () => {
        it('should successfully consume and process a message', async () => {
            const testMessage = { id: 1, data: 'test' };
            const mockProcessMessage = jest.fn().mockResolvedValue(true);

            // Setup the consume mock to simulate message processing
            mockChannel.consume.mockImplementation((queue, callback) => {
                callback({
                    content: Buffer.from(JSON.stringify(testMessage)),
                });
                return Promise.resolve();
            });

            await queueServices.consumeMatchFound(mockProcessMessage, mockIo);

            expect(mockChannel.assertQueue).toHaveBeenCalledWith('match_found', { durable: false });
            expect(mockChannel.consume).toHaveBeenCalledWith('match_found', expect.any(Function));
            expect(mockProcessMessage).toHaveBeenCalledWith(testMessage, mockIo);
            expect(mockChannel.ack).toHaveBeenCalled();
        });

        it('should handle null messages', async () => {
            const mockProcessMessage = jest.fn();

            mockChannel.consume.mockImplementation((queue, callback) => {
                callback(null);
                return Promise.resolve();
            });

            await queueServices.consumeMatchFound(mockProcessMessage, mockIo);

            expect(mockProcessMessage).not.toHaveBeenCalled();
            expect(mockChannel.ack).not.toHaveBeenCalled();
        });

    });

    describe('publishCollaboration', () => {
        it('should successfully publish a message', async () => {
            const testMessage = { id: 1, data: 'test' };

            await queueServices.publishCollaboration(testMessage);

            expect(mockChannel.assertQueue).toHaveBeenCalledWith('collaboration', { durable: false });
            expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
                'collaboration',
                Buffer.from(JSON.stringify(testMessage))
            );
        });

        it('should handle publishing errors', async () => {
            const testMessage = { id: 1, data: 'test' };

            // Mock the sendToQueue to throw an error
            mockChannel.sendToQueue = jest.fn().mockRejectedValue(new Error('Publish error'));

            await expect(queueServices.publishCollaboration(testMessage))
                .rejects
                .toThrow('Failed to publish message to collaboration');

            expect(mockChannel.assertQueue).toHaveBeenCalledWith('collaboration', { durable: false });
        });
    });
});