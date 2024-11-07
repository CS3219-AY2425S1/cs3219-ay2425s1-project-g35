import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from 'react-cookie';

const useLogin = () => {
    const [isLoading, setLoading] = useState(false);
    const [isInvalidLogin, setIsInvalidLogin] = useState(false);
    const [cookies, setCookie] = useCookies([ "username", "accessToken", "userId" ]);
    const navigate = useNavigate();

    const handleLogin = async (email, password) => {
        setLoading(true);
        setIsInvalidLogin(false);
        try {
            const response = await fetch(`https://3103.seewhyjay.dev/api/users/auth/login`, {
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
            console.log(`successfully login ${email}`);
            sessionStorage.setItem("accessToken", data["data"]["accessToken"]);
            sessionStorage.setItem("userId", data["data"]["id"]);
            sessionStorage.setItem("username", data["data"]["username"]);
            setCookie( "accessToken", data["data"]["accessToken"], { path: '/cs3219-ay2425s1-project-g35/' } );
            setCookie( "userId", data["data"]["id"], { path: '/cs3219-ay2425s1-project-g35/' } );
            setCookie( "username", data["data"]["username"], { path: '/cs3219-ay2425s1-project-g35/' } );
            navigate("/cs3219-ay2425s1-project-g35/", { replace: true} );
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