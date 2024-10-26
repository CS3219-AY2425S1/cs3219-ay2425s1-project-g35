// src/App.js
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3002'); // Update with your backend server address if different

function App() {
    const [content, setContent] = useState('');
    const [roomId, setRoomId] = useState('room1'); // Sample room ID
    const [cursors, setCursors] = useState({});

    useEffect(() => {
        console.log('Connecting to the server and joining room:', roomId);

        // Join a room
        socket.emit('joinRoom', { roomId });
        console.log('Emitted joinRoom event with roomId:', roomId);

        // Listen for initial document and cursor data
        socket.on('collaboration_ready', (data) => {
            console.log('Received collaboration_ready event with data:', data);
            setContent(data.documentContent || '');
            setCursors(data.cursors || {});
        });

        // Listen for document updates
        socket.on('documentUpdate', (data) => {
            console.log('Received documentUpdate event with content:', data.content);
            setContent(data.content);
        });

        // Listen for cursor updates
        socket.on('cursorUpdate', (data) => {
            console.log('Received cursorUpdate event from user:', data.userId, 'with cursor position:', data.cursorPosition);
            setCursors((prevCursors) => ({
                ...prevCursors,
                [data.userId]: data.cursorPosition,
            }));
        });

        return () => {
            console.log('Disconnecting socket');
            socket.disconnect();
        };
    }, [roomId]);

    const handleEdit = (e) => {
        const newContent = e.target.value;
        console.log('User editing document. New content:', newContent);
        setContent(newContent);
        socket.emit('editDocument', { roomId, content: newContent });
        console.log('Emitted editDocument event with roomId:', roomId, 'and content:', newContent);
    };

    const handleCursorPosition = (position) => {
        const userId = 'user1'; // Replace with dynamically generated user ID
        console.log('User cursor moved. Position:', position);
        socket.emit('updateCursor', { roomId, userId, cursorPosition: position });
        console.log('Emitted updateCursor event with roomId:', roomId, 'userId:', userId, 'and cursor position:', position);
    };

    return (
        <div>
            <h1>Collaborative Editor</h1>
            <textarea
                value={content}
                onChange={handleEdit}
                onMouseUp={(e) => handleCursorPosition(e.target.selectionStart)}
                rows="10"
                cols="50"
            />
            <div>
                <h3>Connected Cursors:</h3>
                {Object.entries(cursors).map(([userId, position]) => (
                    <p key={userId}>{userId}: {position}</p>
                ))}
            </div>
        </div>
    );
}

export default App;
