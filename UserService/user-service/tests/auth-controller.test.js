import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { handleLogin, handleVerifyToken } from '../controller/auth-controller.js';
import * as repository from '../model/repository.js';
import UserModel from '../model/user-model.js';

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    process.env.JWT_SECRET = 'test-secret-key';
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    await UserModel.deleteMany({});
});

describe('Authentication Controller', () => {
    describe('handleLogin', () => {
        let mockReq;
        let mockRes;
        let testUser;
        const plainPassword = 'testPassword123';

        beforeEach(async () => {
            // Create mock request and response objects
            mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            mockReq = {
                body: {
                    email: 'test@example.com',
                    password: plainPassword
                }
            };

            // Create a test user with hashed password
            const hashedPassword = await bcrypt.hash(plainPassword, 10);
            testUser = await UserModel.create({
                username: 'testuser',
                email: 'test@example.com',
                password: hashedPassword,
                proficiency: 'Beginner'
            });
        });

        it('should successfully log in with correct credentials', async () => {
            await handleLogin(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'User logged in',
                    data: expect.objectContaining({
                        accessToken: expect.any(String),
                        id: testUser.id,
                        username: testUser.username,
                        email: testUser.email
                    })
                })
            );

            // Verify the token is valid
            const responseData = mockRes.json.mock.calls[0][0].data;
            const decoded = jwt.verify(responseData.accessToken, process.env.JWT_SECRET);
            expect(decoded.id).toBe(testUser.id);
        });

        it('should fail login with incorrect password', async () => {
            mockReq.body.password = 'wrongpassword';

            await handleLogin(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Wrong email and/or password'
            });
        });

        it('should fail login with non-existent email', async () => {
            mockReq.body.email = 'nonexistent@example.com';

            await handleLogin(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Wrong email and/or password'
            });
        });

        it('should handle missing email', async () => {
            mockReq.body = { password: plainPassword };

            await handleLogin(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Missing email and/or password'
            });
        });

        it('should handle missing password', async () => {
            mockReq.body = { email: 'test@example.com' };

            await handleLogin(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Missing email and/or password'
            });
        });

        it('should handle database errors', async () => {
            // Mock repository function to throw error
            jest.spyOn(repository, 'findUserByEmail').mockRejectedValueOnce(new Error('Database error'));

            await handleLogin(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Database error'
            });
        });
    });

    describe('handleVerifyToken', () => {
        let mockReq;
        let mockRes;

        beforeEach(() => {
            mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            mockReq = {
                user: {
                    id: 'testId123',
                    username: 'testuser',
                    email: 'test@example.com',
                    isAdmin: false
                }
            };
        });

        it('should successfully verify valid token', async () => {
            await handleVerifyToken(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Token verified',
                data: mockReq.user
            });
        });

    });

    describe('Integration Tests', () => {
        it('should maintain consistent user data through login and token verification', async () => {
            // Create test user
            const plainPassword = 'testPassword123';
            const hashedPassword = await bcrypt.hash(plainPassword, 10);
            const testUser = await UserModel.create({
                username: 'testuser',
                email: 'test@example.com',
                password: hashedPassword,
                proficiency: 'Beginner'
            });

            // Login
            const loginReq = {
                body: {
                    email: 'test@example.com',
                    password: plainPassword
                }
            };
            const loginRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await handleLogin(loginReq, loginRes);

            // Extract token from login response
            const loginResponse = loginRes.json.mock.calls[0][0];
            const accessToken = loginResponse.data.accessToken;

            // Verify token
            const verifyReq = {
                user: {
                    id: testUser.id,
                    username: testUser.username,
                    email: testUser.email,
                    isAdmin: testUser.isAdmin
                }
            };
            const verifyRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await handleVerifyToken(verifyReq, verifyRes);

            // Verify consistent user data
            const verifyResponse = verifyRes.json.mock.calls[0][0];
            expect(verifyResponse.data.id).toBe(testUser.id);
            expect(verifyResponse.data.username).toBe(testUser.username);
            expect(verifyResponse.data.email).toBe(testUser.email);
        });
    });
});