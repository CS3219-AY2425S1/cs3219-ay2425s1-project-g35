import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

const useRegister = () => {
    const [isLoading, setLoading] = useState(false);
    const [isInvalidRegister, setIsInvalidRegister] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (username, email, password) => {
        setLoading(true);
        setIsInvalidRegister(false);
        try {
            const response = await fetch('https://3103.seewhyjay.dev/api/users/users', {
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
            navigate("/cs3219-ay2425s1-project-g35/", { replace: true} );
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