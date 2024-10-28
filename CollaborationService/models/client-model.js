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

    getAllClients() {
        return Array.from(this.clients.entries());
    }
}

const clientInstance = new Client();

export default clientInstance;
