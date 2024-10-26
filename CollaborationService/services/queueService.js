import connectRabbitMQ from '../config/rabbitmq.js';

const MATCH_FOUND_QUEUE = 'match_found';
const COLLAB_QUEUE = 'collaboration';

async function getChannel() {
    const { channel } = await connectRabbitMQ();
    return channel;
}

async function consumeMatchFound(processMessage) {
    try {
        const channel = await getChannel();
        await channel.assertQueue(MATCH_FOUND_QUEUE, { durable: false });

        channel.consume(MATCH_FOUND_QUEUE, async (msg) => {
            if (msg !== null) {
                const message = JSON.parse(msg.content.toString());
                console.log(`Consumed message from ${MATCH_FOUND_QUEUE}`, message);

                try {
                    await processMessage(message);
                    channel.ack(msg);
                } catch (error) {
                    console.log(error);
                    throw new Error(`Error processing message from ${MATCH_FOUND_QUEUE}`);
                }
            }
        });
    } catch (error) {
        console.log(error);
        throw new Error(`Error consuming message from ${MATCH_FOUND_QUEUE}`);
    }
}

async function publishCollaboration(message) {
    const channel = await getChannel();
    await channel.assertQueue(COLLAB_QUEUE, { durable: false });
    channel.sendToQueue(COLLAB_QUEUE, Buffer.from(JSON.stringify(message)));

    console.log(`Published message to RabbitMQ ${COLLAB_QUEUE} queue:`, message);
}


export default {
    consumeMatchFound,
    publishCollaboration
};