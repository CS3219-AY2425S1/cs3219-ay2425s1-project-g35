import roomService from '../services/roomService.js';
import Room from '../models/room-model.js';

global.fetch = jest.fn();

describe('roomService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createRoom', () => {
        test('should create a room with a fetched question', async () => {
            const mockQuestion = {
                "Question ID": 42,
                "Question Title": "Sample Question",
                "Question Description": "Sample description.",
                "Question Categories": ["topic"],
                "Link": "https://example.com",
                "Question Complexity": "easy"
            };

            fetch.mockResolvedValue({
                ok: true,
                json: async () => mockQuestion,
            });

            const room = await roomService.createRoom('room1', 'user1', 'user2', 'topic', 'easy');
            expect(room).toBeTruthy();
            expect(room.question).toEqual(mockQuestion);
            expect(room.users).toEqual(['user1', 'user2']);
        });

        test('should create a room with null question if fetch fails', async () => {
            // Mock console.error to ignore error logs
            const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

            fetch.mockRejectedValue(new Error('Network error'));

            const room = await roomService.createRoom('room1', 'user1', 'user2', 'topic', 'easy');
            expect(room).toBeNull();
            // Restore console.error after the test
            consoleErrorMock.mockRestore();
        });
    });

    describe('getRoom', () => {
        test('should return the room for a given roomId', async () => {
            const mockRoom = new Room('room1', 'user1', 'user2', { title: 'Mock Question' });
            roomService.createRoom('room1', 'user1', 'user2', 'topic', 'easy');
            const room = roomService.getRoom('room1');

            expect(room).toBeTruthy();
            expect(room.roomId).toBe('room1');
            expect(room.users).toEqual(['user1', 'user2']);
        });

        test('should return undefined for a non-existent roomId', () => {
            const room = roomService.getRoom('nonExistentRoom');
            expect(room).toBeUndefined();
        });
    });

    describe('updateContent', () => {
        test('should update the document content of a room', async () => {
            await roomService.createRoom('room1', 'user1', 'user2', 'topic', 'easy');
            roomService.updateContent('room1', 'New content for the room');

            const room = roomService.getRoom('room1');
            expect(room.documentContent).toBe('New content for the room');
        });

        test('should throw an error if room does not exist', () => {
            expect(() => roomService.updateContent('nonExistentRoom', 'content')).toThrow();
        });
    });

    describe('updateLanguage', () => {
        test('should update the programming language of a room', async () => {
            await roomService.createRoom('room1', 'user1', 'user2', 'topic', 'easy');
            roomService.updateLanguage('room1', 'python');

            const room = roomService.getRoom('room1');
            expect(room.language).toBe('python');
        });

        test('should throw an error if room does not exist', () => {
            expect(() => roomService.updateLanguage('nonExistentRoom', 'python')).toThrow();
        });
    });

    describe('updateCursorPosition', () => {
        test('should update the cursor position for a user in a room', async () => {
            await roomService.createRoom('room1', 'user1', 'user2', 'topic', 'easy');
            roomService.updateCursorPosition('room1', 'user1', { line: 5, ch: 10 });

            const room = roomService.getRoom('room1');
            expect(room.cursors['user1']).toEqual({ line: 5, ch: 10 });
        });

        test('should throw an error if room does not exist', () => {
            expect(() => roomService.updateCursorPosition('nonExistentRoom', 'user1', { line: 5, ch: 10 })).toThrow();
        });
    });
});
