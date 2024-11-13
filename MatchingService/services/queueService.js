import connectRabbitMQ from '../config/rabbitmq.js';
import QueueModel from '../models/queue-model.js';

const MATCH_REQUEST_QUEUE = 'match_requests';
const MATCH_FOUND_QUEUE = 'match_found';

async function getChannel() {
    const { channel } = await connectRabbitMQ();
    return channel;
}

async function publishMatchRequest(message) {
    const channel = await getChannel();
    await channel.assertQueue(MATCH_REQUEST_QUEUE, { durable: false });
    channel.sendToQueue(MATCH_REQUEST_QUEUE, Buffer.from(JSON.stringify(message)));

    console.log(`Published message to RabbitMQ ${MATCH_REQUEST_QUEUE} queue:`, message);
}

async function consumeMatchRequests(processMessage) {
    try {
        const channel = await getChannel();
        await channel.assertQueue(MATCH_REQUEST_QUEUE, { durable: false });

        channel.consume(MATCH_REQUEST_QUEUE, async (msg) => {
            if (msg !== null) {
                const message = JSON.parse(msg.content.toString());
                const { userId } = message;

                // Check if the user is still in the Redis queue
                const isUserInQueue = await QueueModel.isUserInQueue(userId);

                console.log('Consumed message from RabbitMQ:', message);

                try {
                    if (isUserInQueue) {
                        await processMessage(message);
                    }
                    channel.ack(msg);
                } catch (error) {
                    console.log(error);
                    throw new Error(`Error processing message from ${MATCH_REQUEST_QUEUE}`);
                }
            }
        });
    } catch (error) {
        console.log(error);
        throw new Error(`Error consuming message from ${MATCH_REQUEST_QUEUE}`);
    }
}

async function publishMatchFound(message) {
    const channel = await getChannel();
    await channel.assertQueue(MATCH_FOUND_QUEUE, { durable: false });
    channel.sendToQueue(MATCH_FOUND_QUEUE, Buffer.from(JSON.stringify(message)));

    console.log(`Published message to RabbitMQ ${MATCH_FOUND_QUEUE} queue:`, message);
}


export default {
    publishMatchRequest,
    consumeMatchRequests,
    publishMatchFound
};
