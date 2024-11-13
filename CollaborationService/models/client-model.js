import createRedisConnection from '../config/redis.js';

const client = createRedisConnection();

class Client {
    async addClient(userId, socketId) {
        try {
            await client.hSet('clients', userId, socketId);
        } catch (error) {
            console.error('Error adding client to Redis:', error);
        }
    }

    async removeClient(userId) {
        try {
            const resolvedUserId = await userId;
            await client.hDel('clients', resolvedUserId);
        } catch (error) {
            console.error('Error removing client from Redis:', error);
        }
    }

    async getSocketId(userId) {
        try {
            const socketId = await client.hGet('clients', userId); 
            return socketId;
        } catch (error) {
            console.error('Error retrieving socketId from Redis:', error);
            return null;
        }
    }

    async getUserIdBySocketId(socketId) {
        try {
            const clients = await client.hGetAll('clients');
            for (const [userId, id] of Object.entries(clients)) {
                if (id === socketId) {
                    return userId;
                }
            }
            return null;
        } catch (error) {
            console.error('Error retrieving userId by socketId from Redis:', error);
            return null;
        }
    }

    async getAllClients() {
        try {
            const clients = await client.hGetAll('clients');
            return Object.entries(clients); 
        } catch (error) {
            console.error('Error retrieving all clients from Redis:', error);
            return [];
        }
    }
}

const clientInstance = new Client();

export default clientInstance;
