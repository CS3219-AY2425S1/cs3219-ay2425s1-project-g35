class Room {
    constructor(roomId, user1Id, user2Id, question) {
        this.roomId = roomId;
        this.users = [user1Id, user2Id]; 
        this.question = question; 
        this.documentContent = ''; 
        this.cursors = {}; 
    }

    updateContent(content) {
        this.documentContent = content;
    }

    updateCursorPosition(userId, position) {
        this.cursors[userId] = position;
    }

    getRoomState() {
        return {
            roomId: this.roomId,
            users: this.users,
            question: this.question,
            documentContent: this.documentContent,
            cursors: this.cursors
        };
    }
}

export default Room;
