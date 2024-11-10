import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

const useRegister = () => {
    const [isLoading, setLoading] = useState(false);
    const [isInvalidRegister, setIsInvalidRegister] = useState(false);
    const navigate = useNavigate();

    const VITE_USER_SERVICE_API = import.meta.env.VITE_USER_SERVICE_API || 'http://localhost/api/users';
    
    console.log(VITE_USER_SERVICE_API);

    const handleRegister = async (username, email, password) => {
        setLoading(true);
        setIsInvalidRegister(false);
        try {
            const response = await fetch(`${VITE_USER_SERVICE_API}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password,
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to register');
            }
            const data = await response.json();
            console.log(data);
            console.log(`successfully registered ${email}`);
            navigate("/", { replace: true} );
        } catch (error) {
            setIsInvalidRegister(true);
            setLoading(false);
            console.log(error);
            alert(error); 
        }
    }

    return {
        handleRegister,
        isLoading,
        isInvalidRegister,
    };
}

export default useRegister