import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from 'react-cookie';

const useLogin = () => {
    const [isLoading, setLoading] = useState(false);
    const [isInvalidLogin, setIsInvalidLogin] = useState(false);
    const [cookies, setCookie] = useCookies([ "accessToken", "userId" ]);
    const navigate = useNavigate();

    const handleLogin = async (email, password) => {
        setLoading(true);
        setIsInvalidLogin(false);
        try {
            const response = await fetch(`http://localhost:3001/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', 
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to login');
            }
            const data = await response.json();
            console.log(data);
            console.log(`successfully login ${email}`);
            setCookie( "accessToken", data["accessToken"], { path: '/' } );
            setCookie( "userId", data["id"], { path: '/' } );
            navigate("/", { replace: true} );
        } catch (error) {
            setIsInvalidLogin(true);
            setLoading(false);
            console.log(error);
            alert(error);
        }
    }

    return {
        handleLogin,
        isLoading,
        isInvalidLogin,
    };
};

export default useLogin;