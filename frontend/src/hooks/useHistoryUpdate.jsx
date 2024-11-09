import { useState } from "react";
import { useCookies } from 'react-cookie';

/**
 * This should be used to update the History information
 */
const useHistoryUpdate = () => {
    const [isLoading, setLoading] = useState(false);
    const [isError, setError] = useState(false);
    const [cookies] = useCookies(['accessToken']);

    const VITE_USER_SERVICE_API = import.meta.env.VITE_USER_SERVICE_API || 'http://localhost/api/users';

    const handleHistoryUpdate = async (userId, sessionId, questionId, questionDescription, language, codeSnippet) => {
        setLoading(true);
        setError(false);
        try {
            const response = await fetch(`${VITE_USER_SERVICE_API}/users/${userId}/history`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${cookies.accessToken}`
                },
                body: JSON.stringify({
                    sessionId: sessionId,
                    questionId: questionId,
                    questionDescription: questionDescription,
                    language: language,
                    codeSnippet: codeSnippet,
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                setLoading(false);
                setError(true);
                throw new Error(errorData.message || 'Failed to update history');
            }
            const data = await response.json();
            console.log(`useHistoryUpdate: Successfully updated history. sessionId ${sessionId}, questionId ${questionId}, language ${language}`);
        } catch (error) {
            setLoading(false);
            setError(true)
            console.log(error);
        }
    }

    return {
        handleHistoryUpdate,
        isLoading,
        isError,
    };
}

export default useHistoryUpdate;