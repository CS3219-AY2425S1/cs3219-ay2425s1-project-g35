import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const useMatcher = (userId) => {
    const [isMatchSuccessful, setIsMatchSuccessful] = useState(null);
    const [timerStart, setTimerStart] = useState(false);
    const [socket, setSocket] = useState(null);
    const API_BASE_URL = 'http://localhost:3000/matcher';

    // Establish socket connection on component mount
    useEffect(() => {
        const socketInstance = io('http://localhost:3000');
        setSocket(socketInstance);

        socketInstance.on('connect', () => {
            console.log('Connected to the backend with socket ID:', socketInstance.id);
        });

        // Handle match found event

        socketInstance.on('matched', (matchData, curData) => {
            console.log('Match found:', matchData, curData);
            setIsMatchSuccessful(true);
            setTimerStart(false);
            alert(
                `Matched with userID: ${matchData.id}
                partner topic: ${matchData.topic}
                partner difficulty: ${matchData.difficulty}
                
                your userID: ${curData.id}
                your topic: ${curData.topic}
                your difficulty: ${curData.difficulty}
                `
            );

            // Redirect to the coding page
            // navigate("/", { replace: true} );
        });

        // Cleanup on unmount
        return () => {
            socketInstance.disconnect();
        };
    }, []);

    // Enqueue a new user for matching
    const enqueueUser = async (topic, diffLevel) => {
        if (!socket) {
            console.error('Socket not initialized');
            return false;
        }

        try {
            setTimerStart(true);
            const response = await fetch(`${API_BASE_URL}/match`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    topic: topic,
                    difficulty: diffLevel,
                    socketId: socket.id, 
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Enqueue Response:', data);
        } catch (error) {
            console.error('Error enqueuing user:', error);
            setTimerStart(false);
            return false;
        }
        return true;
    };

    // Delete a user from queue if the user cancels matching
    const deleteUserFromQueue = async () => {
        console.log('Deleting user');
        try {
            const response = await fetch(`${API_BASE_URL}/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            setTimerStart(false);
            const data = await response.json();
            console.log('Delete Response:', data);
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    return {
        isMatchSuccessful,
        timerStart,
        setTimerStart,
        enqueueUser,
        deleteUserFromQueue,
    };
};

export default useMatcher;
