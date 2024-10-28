class Client {
    constructor() {
        this.clients = new Map();
    }

    addClient(userId, socketId) {
        this.clients.set(userId, socketId);
    }

    removeClient(userId) {
        this.clients.delete(userId);
    }

    getSocketId(userId) {
        return this.clients.get(userId);
    }

    getUserIdBySocketId(socketId) {
        for (const [userId, id] of this.clients.entries()) {
            if (id === socketId) {
                return userId;
            }
        }
        return null;
    }

    getAllClients() {
        return Array.from(this.clients.entries());
    }
}

const clientInstance = new Client();

export default clientInstance;
