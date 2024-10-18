import { useState, useEffect } from 'react';

const useMatcher = (userId) => {
    const [isMatchSuccessful, setIsMatchSuccessful] = useState(null);
    const [timerStart, setTimerStart] = useState(false);
    const API_BASE_URL = 'http://localhost:3000/matcher';

    const fetchMatchingData = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/`);
            const data = await response.json();
            console.log(data);
            return data;
        } catch (error) {
            console.error('Error fetching matching data:', error);
        }
    };

    // Enqueue a new user for matching
    const enqueueUser = async (topic, diffLevel) => {
        try {
            const response = await fetch(`${API_BASE_URL}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    topic: topic,
                    diffLevel: diffLevel,
                }),
            });
            const data = await response.json();
            console.log('Enqueue Response:', data);
            setTimerStart(true);
            listenToSSE();
        } catch (error) {
            console.error('Error enqueuing user:', error);
        }
    };

    // Delete a user from queue if the user cancels matching
    const deleteUserFromQueue = async (topic, diffLevel) => {
        console.log('Deleting user');
        try {
            const response = await fetch(`${API_BASE_URL}/${userId}/${encodeURIComponent(topic)}/${encodeURIComponent(diffLevel)}`, {
                method: 'DELETE',
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

    // Listen to Server-Sent Events (SSE)
    const listenToSSE = () => {
        const eventSource = new EventSource(`${API_BASE_URL}/events`); 
    
        eventSource.addEventListener('matchFound', (event) => {
            const data = JSON.parse(event.data); // Parse the event data
            console.log('Match found:', data);
            setStatusMessage('You have been matched with ___ <update this>');
            setIsMatchSuccessful(true)
        });
    
        eventSource.addEventListener('matchNotFound', (event) => {
            const data = JSON.parse(event.data);
            console.log('Match not found for:', data.user);
            setStatusMessage('No match found, please try again.');
            setIsMatchSuccessful(false)
        });
    
        eventSource.onerror = (error) => {
            console.error('SSE error:', error);
        };
    };

    // useEffect(() => {
    //     fetchMatchingData();
    //     listenToSSE();
    // }, []);

    return {
        isMatchSuccessful,
        timerStart,
        setTimerStart,
        enqueueUser,
        deleteUserFromQueue,
    };
};

export default useMatcher;
