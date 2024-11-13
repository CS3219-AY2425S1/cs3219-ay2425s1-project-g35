import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as userController from '../controller/user-controller.js';
import UserModel from '../model/user-model.js';

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

describe('User Controller', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        mockReq = {
            params: {},
            body: {}
        };
    });

    describe('createUser', () => {
        beforeEach(() => {
            mockReq.body = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                proficiency: 'Beginner',
                displayName: 'Test User'
            };
        });

        it('should create a new user successfully', async () => {
            await userController.createUser(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.stringContaining('Created new user testuser successfully'),
                    data: expect.objectContaining({
                        username: 'testuser',
                        email: 'test@example.com'
                    })
                })
            );
        });

        it('should fail when username already exists', async () => {
            await UserModel.create({
                ...mockReq.body,
                password: await bcrypt.hash('password123', 10)
            });

            await userController.createUser(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(409);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'username or email already exists'
            });
        });

        it('should fail when required fields are missing', async () => {
            mockReq.body = { username: 'testuser' };

            await userController.createUser(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'username and/or email and/or password are missing'
            });
        });
    });

    describe('getUser', () => {
        let testUser;

        beforeEach(async () => {
            testUser = await UserModel.create({
                username: 'testuser',
                email: 'test@example.com',
                password: await bcrypt.hash('password123', 10),
                proficiency: 'Beginner'
            });
        });

        it('should get user by valid ID', async () => {
            mockReq.params.id = testUser.id;

            await userController.getUser(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Found user',
                data: expect.objectContaining({
                    username: 'testuser',
                    email: 'test@example.com'
                })
            });
        });

        it('should return 404 for invalid ObjectId', async () => {
            mockReq.params.id = 'invalid-id';

            await userController.getUser(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
        });
    });

    describe('getAllUsers', () => {
        beforeEach(async () => {
            await UserModel.create([
                {
                    username: 'user1',
                    email: 'user1@example.com',
                    password: await bcrypt.hash('password123', 10),
                    proficiency: 'Beginner'
                },
                {
                    username: 'user2',
                    email: 'user2@example.com',
                    password: await bcrypt.hash('password123', 10),
                    proficiency: 'Expert'
                }
            ]);
        });

        it('should return all users', async () => {
            await userController.getAllUsers(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            const response = mockRes.json.mock.calls[0][0];
            expect(response.data).toHaveLength(2);
            expect(response.data[0]).toHaveProperty('username');
            expect(response.data[1]).toHaveProperty('email');
        });
    });

    describe('addUserHistory', () => {
        let testUser;

        beforeEach(async () => {
            testUser = await UserModel.create({
                username: 'testuser',
                email: 'test@example.com',
                password: await bcrypt.hash('password123', 10),
                proficiency: 'Beginner'
            });

            mockReq.body = {
                sessionId: 'session123',
                questionId: 'question123',
                questionDescription: 'Test Question',
                language: 'javascript',
                codeSnippet: 'console.log("test")'
            };
        });

        it('should add history entry successfully', async () => {
            mockReq.params.id = testUser.id;

            await userController.addUserHistory(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            const response = mockRes.json.mock.calls[0][0];
            expect(response.data.history).toHaveLength(1);
            expect(response.data.history[0]).toMatchObject({
                sessionId: 'session123',
                questionId: 'question123'
            });
        });

        it('should fail with missing required fields', async () => {
            mockReq.params.id = testUser.id;
            mockReq.body = { sessionId: 'session123' };

            await userController.addUserHistory(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
        });
    });

    describe('updateUser', () => {
        let testUser;

        beforeEach(async () => {
            testUser = await UserModel.create({
                username: 'testuser',
                email: 'test@example.com',
                password: await bcrypt.hash('password123', 10),
                proficiency: 'Beginner'
            });

            mockReq.params.id = testUser.id;
            mockReq.body = {
                username: 'updateduser',
                email: 'updated@example.com',
                proficiency: 'Expert'
            };
        });

        it('should update user successfully', async () => {
            await userController.updateUser(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            const response = mockRes.json.mock.calls[0][0];
            expect(response.data).toMatchObject({
                username: 'updateduser',
                email: 'updated@example.com',
                proficiency: 'Expert'
            });
        });

        it('should fail when username already exists', async () => {
            await UserModel.create({
                username: 'updateduser',
                email: 'other@example.com',
                password: await bcrypt.hash('password123', 10)
            });

            await userController.updateUser(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(409);
        });
    });

    describe('updateUserPrivilege', () => {
        let testUser;

        beforeEach(async () => {
            testUser = await UserModel.create({
                username: 'testuser',
                email: 'test@example.com',
                password: await bcrypt.hash('password123', 10),
                isAdmin: false
            });

            mockReq.params.id = testUser.id;
            mockReq.body = { isAdmin: true };
        });

        it('should update user privilege successfully', async () => {
            await userController.updateUserPrivilege(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            const response = mockRes.json.mock.calls[0][0];
            expect(response.data.isAdmin).toBe(true);
        });

        it('should fail when isAdmin is missing', async () => {
            mockReq.body = {};

            await userController.updateUserPrivilege(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
        });
    });

    describe('deleteUser', () => {
        let testUser;

        beforeEach(async () => {
            testUser = await UserModel.create({
                username: 'testuser',
                email: 'test@example.com',
                password: await bcrypt.hash('password123', 10)
            });

            mockReq.params.id = testUser.id;
        });

        it('should delete user successfully', async () => {
            await userController.deleteUser(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            const deletedUser = await UserModel.findById(testUser.id);
            expect(deletedUser).toBeNull();
        });

        it('should return 404 for non-existent user', async () => {
            mockReq.params.id = new mongoose.Types.ObjectId();

            await userController.deleteUser(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
        });
    });

    describe('formatUserResponse', () => {
        it('should format user data correctly', () => {
            const user = {
                id: 'testid123',
                username: 'testuser',
                email: 'test@example.com',
                proficiency: 'Beginner',
                displayName: 'Test User',
                isAdmin: false,
                createdAt: new Date(),
                history: [],
                password: 'should-not-be-included'
            };

            const formatted = userController.formatUserResponse(user);

            expect(formatted).toHaveProperty('id');
            expect(formatted).toHaveProperty('username');
            expect(formatted).not.toHaveProperty('password');
            expect(formatted.history).toEqual([]);
        });
    });
});