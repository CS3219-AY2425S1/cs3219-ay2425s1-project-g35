import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const useMatcher = (userId) => {
    const [isMatchSuccessful, setIsMatchSuccessful] = useState(null);
    const [timerStart, setTimerStart] = useState(false);
    const [socket, setSocket] = useState(null);
    const API_BASE_URL = 'http://localhost:3000/matcher';
    const navigate = useNavigate();
    

    // Establish socket connection on component mount
    useEffect(() => {
        const socketInstance = io('http://localhost:3000');
        setSocket(socketInstance);

        socketInstance.on('connect', () => {
            console.log('Connected to the backend with socket ID:', socketInstance.id);
        });

        // Handle match found event

        socketInstance.on('matched', (matchFoundEvent) => {
            console.log('Match found:', matchFoundEvent);
            setIsMatchSuccessful(true);
            setTimerStart(false);
            const roomId = matchFoundEvent.roomId;
            
            
            navigate(`/collab/${roomId}`, { replace: true} );
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
