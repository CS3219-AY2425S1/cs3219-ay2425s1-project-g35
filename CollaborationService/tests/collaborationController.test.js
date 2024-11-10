// __tests__/collaborationController.test.js
import collaborationController from '../controllers/collaborationController.js';
import roomService from '../services/roomService.js';
import clientInstance from '../models/client-model.js';

jest.mock('../services/roomService.js');
jest.mock('../models/client-model.js');

describe('collaborationController', () => {
    const mockIo = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
    };

    beforeEach(() => {
        mockIo.to.mockClear();
        mockIo.emit.mockClear();
        roomService.createRoom.mockClear();
        clientInstance.getSocketId.mockClear();
    });

    test('handleMatchFound should create room and emit collaboration_ready', async () => {
        const matchData = {
            roomId: 'room1',
            user1_Id: 'user1',
            user2_id: 'user2',
            topic: 'topic',
            difficulty: 'easy'
        };

        const mockRoom = {
            roomId: 'room1',
            question: {
                "Question ID": 11,
                "Question Title": "Longest Common Subsequence",
            },
        };

        roomService.createRoom.mockResolvedValue(mockRoom);
        clientInstance.getSocketId.mockReturnValueOnce('socket1').mockReturnValueOnce('socket2');

        await collaborationController.handleMatchFound(matchData, mockIo);

        expect(roomService.createRoom).toHaveBeenCalledWith('room1', 'user1', 'user2', 'topic', 'easy');
        expect(mockIo.to).toHaveBeenCalledWith('socket1');
        expect(mockIo.to).toHaveBeenCalledWith('socket2');
        expect(mockIo.emit).toHaveBeenCalledWith('collaboration_ready', {
            roomId: 'room1',
            question: mockRoom.question,
        });
    });
});
