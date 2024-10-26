import amqp from 'amqplib';
const hostname = 'rabbitmq';

// to do: change connection
async function connectRabbitMQ(retries = 5) {
    try {
        const connection = await amqp.connect({
            protocol: 'amqp',
            hostname: hostname, 
            port: 5672,
        });
        const channel = await connection.createChannel();
        console.log("Successfully connected to RabbitMQ")
        return { connection, channel };
    } catch (error) {
        if (retries > 0) {
            console.log(`Retrying to connect to RabbitMQ... (${retries} attempts left)`);
            await new Promise((resolve) => setTimeout(resolve, 5000));
            return connectRabbitMQ(retries - 1);
        } else {
            console.error(`Failed to connect to RabbitMQ after ${retries} attempts`);
            return null;
        }
    }
}

export default connectRabbitMQ;