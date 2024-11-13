import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import app from '../index.js';
import UserModel from '../model/user-model.js';
import * as repository from '../model/repository.js';
import { verifyAccessToken, verifyIsAdmin, verifyIsOwnerOrAdmin } from '../middleware/basic-access-control.js';

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    await UserModel.deleteMany({});
});


describe('User Model', () => {
    it('should validate email format', async () => {
        const invalidUser = new UserModel({
            username: 'testuser',
            email: 'invalid-email',
            password: 'password123',
            proficiency: 'Beginner'
        });

        await expect(invalidUser.validate()).rejects.toThrow();
    });

    it('should create user with valid data', async () => {
        const validUser = new UserModel({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            proficiency: 'Beginner'
        });

        const savedUser = await validUser.save();
        expect(savedUser.username).toBe('testuser');
        expect(savedUser.email).toBe('test@example.com');
        expect(savedUser.isAdmin).toBe(false);
    });
});

describe('Repository Functions', () => {
    let testUser;

    beforeEach(async () => {
        testUser = await repository.createUser(
            'testuser',
            'test@example.com',
            'password123',
            'Beginner',
            'Test User'
        );
    });

    it('should find user by email', async () => {
        const foundUser = await repository.findUserByEmail('test@example.com');
        expect(foundUser.username).toBe('testuser');
    });

    it('should find user by username or email', async () => {
        const foundUser = await repository.findUserByUsernameOrEmail('testuser', 'test@example.com');
        expect(foundUser.username).toBe('testuser');
    });

    it('should update user by id', async () => {
        const updatedUser = await repository.updateUserById(
            testUser._id,
            'updateduser',
            'updated@example.com',
            'newpassword',
            'Expert',
            'Updated User'
        );

        expect(updatedUser.username).toBe('updateduser');
        expect(updatedUser.email).toBe('updated@example.com');
        expect(updatedUser.proficiency).toBe('Expert');
    });

    it('should add history entry', async () => {
        const historyEntry = {
            sessionId: '123',
            questionId: 'q1',
            questionDescription: 'Test question',
            language: 'javascript',
            codeSnippet: 'console.log("test")'
        };

        const updatedUser = await repository.addHistoryEntry(testUser._id, historyEntry);
        expect(updatedUser.history).toHaveLength(1);
        expect(updatedUser.history[0].sessionId).toBe('123');
        expect(updatedUser.history[0].questionId).toBe('q1');
    });
});

describe('Access Control Middleware', () => {
    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        mockReq = {
            headers: {},
            user: {},
            params: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        mockNext = jest.fn();
        process.env.JWT_SECRET = 'test-secret';
    });

    describe('verifyAccessToken', () => {
        it('should fail when no authorization header is present', async () => {
            await verifyAccessToken(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Authentication failed' });
        });

    });

    describe('verifyIsAdmin', () => {
        it('should allow admin access', () => {
            mockReq.user.isAdmin = true;
            verifyIsAdmin(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalled();
        });

        it('should deny non-admin access', () => {
            mockReq.user.isAdmin = false;
            verifyIsAdmin(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(403);
        });
    });

    describe('verifyIsOwnerOrAdmin', () => {
        it('should allow admin access', () => {
            mockReq.user.isAdmin = true;
            mockReq.params.id = 'user123';
            mockReq.user.id = 'differentuser123';

            verifyIsOwnerOrAdmin(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalled();
        });

        it('should allow owner access', () => {
            mockReq.user.isAdmin = false;
            mockReq.params.id = 'user123';
            mockReq.user.id = 'user123';

            verifyIsOwnerOrAdmin(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalled();
        });

        it('should deny non-owner non-admin access', () => {
            mockReq.user.isAdmin = false;
            mockReq.params.id = 'user123';
            mockReq.user.id = 'differentuser123';

            verifyIsOwnerOrAdmin(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(403);
        });
    });
});