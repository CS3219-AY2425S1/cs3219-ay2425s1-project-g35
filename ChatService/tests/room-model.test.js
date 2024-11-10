import Room from '../models/room-model';

describe('Room model', () => {
    let room;
    let roomId;
    let user1;
    let user2;

    beforeEach(() => {
        roomId = 'test-room';
        user1 = 'user1';
        user2 = 'user2';
        room = new Room(roomId, user1, user2);
    });

    describe('constructor', () => {
        it('should initialize with a roomId, users, and an empty messages array', () => {
            expect(room.roomId).toBe(roomId);
            expect(room.users).toEqual([user1, user2]);
            expect(room.messages).toEqual([]);
        });
    });

    describe('addMessage', () => {
        it('should add a message to the messages array with content and senderUsername', () => {
            const messageContent = 'Hello!';
            const senderUsername = 'user1';

            const result = room.addMessage(messageContent, senderUsername);

            // Validate the message object structure
            expect(result).toMatchObject({
                content: messageContent,
                senderUsername: senderUsername,
            });

            // Ensure a timestamp is added
            expect(new Date(result.timestamp)).toBeInstanceOf(Date);

            // Check if the message is added to the messages array
            expect(room.messages).toContainEqual(result);
        });
    });

    describe('getRoomState', () => {
        it('should return the room state with roomId, users, and messages', () => {
            const roomState = room.getRoomState();

            expect(roomState).toEqual({
                roomId: roomId,
                users: [user1, user2],
                messages: room.messages, // Should initially be an empty array
            });
        });

        it('should include all messages added to the room in getRoomState', () => {
            // Add a couple of messages to the room
            room.addMessage('Hello from user1', 'user1');
            room.addMessage('Hello from user2', 'user2');

            const roomState = room.getRoomState();

            expect(roomState.messages.length).toBe(2);
            expect(roomState.messages[0]).toMatchObject({
                content: 'Hello from user1',
                senderUsername: 'user1',
            });
            expect(roomState.messages[1]).toMatchObject({
                content: 'Hello from user2',
                senderUsername: 'user2',
            });
        });
    });
});
