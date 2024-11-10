import { createServer } from 'http';
import matchController from '../controllers/matchController';
import matchRoutes from '../routes/matchRoutes';
import app from '../app';

// Mock external modules
jest.mock('express', () => {
    const express = jest.fn(() => ({
        use: jest.fn(),
        listen: jest.fn().mockImplementation((port, callback) => callback && callback()),
    }));
    express.json = jest.fn(() => jest.fn());
    express.Router = jest.fn(() => ({
        get: jest.fn(),
        post: jest.fn(),
    }));
    return express;
});

jest.mock('cors', () => jest.fn(() => jest.fn()));
jest.mock('cookie-parser', () => jest.fn(() => jest.fn()));
jest.mock('socket.io', () => {
    const SocketServer = jest.fn();
    SocketServer.prototype.on = jest.fn();
    return { Server: SocketServer };
});
jest.mock('../controllers/matchController');
jest.mock('../routes/matchRoutes');

describe('Express Server', () => {
    let server;

    beforeEach(() => {
        // Mock createServer and server.listen
        server = createServer();
        server.listen = jest.fn((port, callback) => callback && callback());
    });

    test('should set up middleware', () => {
        expect(app.use).toHaveBeenCalledWith(expect.any(Function)); // Verifies that app uses middleware
        expect(app.use).toHaveBeenCalledWith('/matcher', matchRoutes); // Verifies the matcher route
    });

    test('should call initializeQueueProcessing with io', () => {
        expect(matchController.initializeQueueProcessing).toHaveBeenCalledWith(expect.any(Object)); // Checks if io was passed
    });

    test('should start listening on specified port', () => {
        const port = 3000;
        server.listen(port, () => {
            expect(server.listen).toHaveBeenCalledWith(port, expect.any(Function));
        });
    });
});
