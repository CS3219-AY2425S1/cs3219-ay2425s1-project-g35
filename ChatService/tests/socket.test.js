import { jest } from '@jest/globals';
import roomService from '../services/roomService.js';
import socketHandler from '../config/socket.js';

jest.mock('../services/roomService.js');

describe('socketHandler', () => {
    let io;
    let socketStub;
    let emitSpy;
    let joinSpy;

    beforeEach(() => {
        io = {
            on: jest.fn(),
            sockets: {
                adapter: {
                    rooms: {
                        get: jest.fn().mockReturnValue(new Set([1, 2])),
                    },
                },
            },
        };

        socketStub = {
            id: 'test-socket-id',
            handshake: {
                query: {
                    userId: 'test-user-id',
                },
            },
            join: jest.fn(),
            emit: jest.fn(),
            to: jest.fn().mockReturnThis(),
        };

        emitSpy = jest.spyOn(socketStub, 'emit');
        joinSpy = jest.spyOn(socketStub, 'join');

        jest.spyOn(roomService, 'createRoom')
            .mockResolvedValueOnce({
                messages: ['test-message'],
            })
            .mockResolvedValueOnce({
                messages: ['test-message', 'new-message'],
            });
        jest.spyOn(roomService, 'getRoom')
            .mockResolvedValue({
                messages: ['test-message'],
            });
        jest.spyOn(roomService, 'addMessage')
            .mockResolvedValue({
                text: 'new-message',
                author: 'test-user',
            });
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should handle "connection" event', () => {
        socketHandler.createSocket(io);
        expect(io.on).toHaveBeenCalledWith('connection', expect.any(Function));
    });
});