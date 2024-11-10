// services/roomService.test.js
import roomService from '../services/roomService';
import Room from '../models/room-model';

jest.mock('../models/room-model');

describe('roomService', () => {
    let roomId, user1, user2, roomInstance;

    beforeEach(() => {
        roomId = 'test-room';
        user1 = 'user1';
        user2 = 'user2';

        // Create a mock Room instance with a mock `addMessage` method
        roomInstance = {
            roomId,
            users: [user1, user2],
            messages: [],
            addMessage: jest.fn(),  // Mock `addMessage` function
        };

        // Ensure Room constructor returns the mock room instance
        Room.mockImplementation(() => roomInstance);
        // Clear rooms object before each test to avoid state carryover
        roomService.createRoom(roomId, user1, user2); // Create the room before each test
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create a new room', () => {
        const room = roomService.createRoom(roomId, user1, user2);

        expect(Room).toHaveBeenCalledWith(roomId, user1, user2);
        expect(room).toBe(roomInstance);
    });

    it('should return an existing room if already created', () => {
        const existingRoom = roomService.createRoom(roomId, user1, user2);

        const room = roomService.createRoom(roomId, user1, user2);

        expect(room).toBe(existingRoom);
    });

    it('should return undefined for a non-existent room', () => {
        const nonExistentRoom = roomService.getRoom('non-existent-room');

        expect(nonExistentRoom).toBeUndefined();
    });

});
