import { createClient } from 'redis';

function createRedisConnection() {
    try {
        const client = createClient({
            socket: {
                host: 'redis-chat',
                port: 6379
            }
        });
        client.connect();
        console.log("Successfully connected to Redis-Chat");
        return client;
    } catch (error) {
        console.log("Error connecting to Redis-Chat ", error);
        return null;
    }
}

export default createRedisConnection;
