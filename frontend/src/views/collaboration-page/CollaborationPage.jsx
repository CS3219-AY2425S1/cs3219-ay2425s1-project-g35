import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const CollaborationPage = ({ roomId }) => {
    const [question, setQuestion] = useState(null);
    const socketUrl = "http://localhost:3000"; // Replace with your WebSocket server URL

    useEffect(() => {
        // Connect to the WebSocket server
        const socket = io(socketUrl, {
            query: { roomId } // Pass the roomId as a query parameter
        });

        // Listen for "question" events from the server
        socket.on("question", (questionDetails) => {
            setQuestion(questionDetails); // Update the state with question details
        });

        // Clean up WebSocket connection on unmount
        return () => {
            socket.disconnect();
        };
    }, [roomId, socketUrl]);

    return (
        <div>
            <h1>Collaboration Room: {roomId}</h1>
            {question ? (
                <div>
                    <h2>Question:</h2>
                    <p>{question.text}</p>
                </div>
            ) : (
                <p>Waiting for question...</p>
            )}
        </div>
    );
};

export default CollaborationPage;
