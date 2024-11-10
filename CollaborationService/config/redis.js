import { createClient } from 'redis';

function createRedisConnection() {
    try {
        const client = createClient({
            socket: {
                host: 'redis-collaboration',
                port: 6379
            }
        });
        client.connect();
        console.log("Successfully connected to Redis-Collaboration");
        return client;
    } catch (error) {
        console.log("Error connecting to Redis-Collaboration ", error);
        return null;
    }
}

export default createRedisConnection;
