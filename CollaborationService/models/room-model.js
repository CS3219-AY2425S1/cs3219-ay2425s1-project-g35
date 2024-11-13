class Room {
    constructor(roomId, user1Id, user2Id, question) {
        this.roomId = roomId;
        this.users = [user1Id, user2Id]; 
        this.question = question; 
        this.documentContent = {
            javascript: "// YOUR FUNCTION BELOW\n\n// YOUR FUNCTION ABOVE\n\n\n// for testing\nconsole.log(/* put your function with parameters here */)",
            python: "# YOUR FUNCTION BELOW\n\n# YOUR FUNCTION ABOVE\n\n\n# for testing\nprint('''put your function with parameters here''')",
            cpp: "#include <iostream>\n\n// YOUR FUNCTION BELOW\n\n// YOUR FUNCTION ABOVE\n\n\n// for testing\nint main() {\n  std::cout << /* put your function and parameters here */;\n}",
            java: "public class Solution {\n  // YOUR FUNCTION BELOW\n\n  // YOUR FUNCTION ABOVE\n\n  // for testing\n  public static void main(String args[]) {\n    System.out.println(/* put your function with parameters here */);\n  }\n}"
        };
        this.language = 'javascript'; // set JavaScript as the default
        this.cursors = {}; 
    }

    updateContent(content) {
        this.documentContent = content;
    }

    updateLanguage(language) {
        this.language = language;
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
            language: this.language,
            cursors: this.cursors
        };
    }
}

export default Room;
