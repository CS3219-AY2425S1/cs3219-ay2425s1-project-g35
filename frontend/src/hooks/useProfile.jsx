import { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';

const API_URL = import.meta.env.VITE_USER_SERVICE_API || 'http://localhost/api/users';

const useProfile = (userId) => {
    const [cookies] = useCookies(['accessToken']);
    const [username, setUsername] = useState(null);
    const [email, setEmail] = useState(null);
    const [createdAt, setCreatedAt] = useState(null);
    const [history, setHistory] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfileInformation = async () => {
            try {
                const response = await fetch(`${API_URL}/users/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${cookies.accessToken}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setUsername(data.data.username);
                setEmail(data.data.email);
                setCreatedAt(data.data.createdAt);
                setHistory(data.data.history);
                console.log(`useProfile called. userId: ${userId},`)
            } catch (error) {
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileInformation();
    }, [cookies.accessToken]);

    useEffect(() => {
        console.log('useProfile.jsx: Updated state:', { username, email, createdAt, history });
    }, [username, email, createdAt, history]);

    return { 
        username, 
        email,
        history,
        createdAt,
        error, 
        isLoading 
    };
};

export default useProfile;