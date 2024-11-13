import { createClient } from 'redis';

function createRedisConnection() {
    try {
        const client = createClient({
            socket: {
                host: 'redis',
                port: 6379
            }
        });
        client.connect();
        console.log("Successfully connected to Redis");
        return client;
    } catch (error) {
        console.log("Error connecting to Redis ", error);
        return null;
    }
}

export default createRedisConnection;
