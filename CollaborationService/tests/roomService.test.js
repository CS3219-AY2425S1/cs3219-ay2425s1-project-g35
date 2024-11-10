// __tests__/roomService.test.js
import roomService from '../services/roomService.js';

global.fetch = jest.fn();

describe('roomService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('createRoom should fetch question and create a room', async () => {
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
    });

    test('createRoom should handle fetch error and return null', async () => {
        const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
        fetch.mockRejectedValue(new Error('Network error'));

        const room = await roomService.createRoom('room1', 'user1', 'user2', 'topic', 'easy');
        expect(room).toBeNull();
        // Restore console.error after the test
        consoleErrorMock.mockRestore();
    });
});
