import { useState, useEffect } from 'react';

const API_URL = 'https://3103.seewhyjay.dev/api/users/';

const useUsername = (id) => {
    const [username, setUsername] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUsername = async () => {
            try {
                const response = await fetch(`${API_URL}/${id}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setUsername(data.username);
            } catch (error) {
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsername();
    }, [id]);

    return { username, error, isLoading };
};

export default useUsername;
