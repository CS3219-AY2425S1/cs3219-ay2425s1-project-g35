class Room {
    constructor(roomId, user1Id, user2Id) {
        this.roomId = roomId;
        this.users = [user1Id, user2Id];
        this.messages = []; // Initialize an empty array to store messages
    }


    addMessage(content, senderUsername) {
        const message = {
            content,
            senderUsername,
            timestamp: new Date().toISOString() // Add a timestamp in ISO format
        };
        this.messages.push(message); // Add the structured message to the messages array
        return message;
    }


    getRoomState() {
        return {
            roomId: this.roomId,
            users: this.users,
            messages: this.messages, // Return the list of messages
        };
    }
}

export default Room;
