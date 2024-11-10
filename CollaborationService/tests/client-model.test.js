import clientInstance from '../models/client-model.js';

describe('Client Model', () => {
    afterEach(() => {
        // Clear all clients after each test to avoid interference between tests
        clientInstance.clients.clear();
    });

    describe('addClient', () => {
        test('should add a client with a userId and socketId', () => {
            clientInstance.addClient('user1', 'socket1');

            expect(clientInstance.clients.size).toBe(1);
            expect(clientInstance.clients.get('user1')).toBe('socket1');
        });

        test('should overwrite the socketId if userId already exists', () => {
            clientInstance.addClient('user1', 'socket1');
            clientInstance.addClient('user1', 'socket2'); // Overwrite with new socketId

            expect(clientInstance.clients.size).toBe(1);
            expect(clientInstance.clients.get('user1')).toBe('socket2');
        });
    });

    describe('removeClient', () => {
        test('should remove a client by userId', () => {
            clientInstance.addClient('user1', 'socket1');
            clientInstance.removeClient('user1');

            expect(clientInstance.clients.size).toBe(0);
            expect(clientInstance.clients.get('user1')).toBeUndefined();
        });

        test('should do nothing if userId does not exist', () => {
            clientInstance.addClient('user1', 'socket1');
            clientInstance.removeClient('nonExistentUser');

            expect(clientInstance.clients.size).toBe(1);
            expect(clientInstance.clients.get('user1')).toBe('socket1');
        });
    });

    describe('getSocketId', () => {
        test('should return the socketId for a given userId', () => {
            clientInstance.addClient('user1', 'socket1');
            const socketId = clientInstance.getSocketId('user1');

            expect(socketId).toBe('socket1');
        });

        test('should return undefined if userId does not exist', () => {
            const socketId = clientInstance.getSocketId('nonExistentUser');
            expect(socketId).toBeUndefined();
        });
    });

    describe('getUserIdBySocketId', () => {
        test('should return the userId for a given socketId', () => {
            clientInstance.addClient('user1', 'socket1');
            const userId = clientInstance.getUserIdBySocketId('socket1');

            expect(userId).toBe('user1');
        });

        test('should return null if socketId does not exist', () => {
            const userId = clientInstance.getUserIdBySocketId('nonExistentSocket');
            expect(userId).toBeNull();
        });
    });

    describe('getAllClients', () => {
        test('should return an array of all clients (userId, socketId pairs)', () => {
            clientInstance.addClient('user1', 'socket1');
            clientInstance.addClient('user2', 'socket2');

            const clients = clientInstance.getAllClients();
            expect(clients).toEqual([
                ['user1', 'socket1'],
                ['user2', 'socket2'],
            ]);
        });

        test('should return an empty array if there are no clients', () => {
            const clients = clientInstance.getAllClients();
            expect(clients).toEqual([]);
        });
    });
});
