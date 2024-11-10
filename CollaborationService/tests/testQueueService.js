import matchQueueService from '../services/queueService.js';

// Sample message to test the queues
const testMessage = {
    userId: 'user123',
    topic: 'collaboration',
    difficulty: 'medium',
};

// Function to simulate processing the message
async function processMessage(message) {
    console.log('Processing message:', message);
}

// Test the publish and consume functions
async function testRabbitMQ() {
    try {
        // Test publishing to COLLAB_QUEUE
        console.log('Publishing to COLLAB_QUEUE...');
        await matchQueueService.publishCollaboration(testMessage);

        console.log('Message successfully published to COLLAB_QUEUE.');
    } catch (error) {
        console.error('Error in RabbitMQ test:', error);
    }
}

testRabbitMQ();