import { useState } from "react";
import { useCookies } from "react-cookie";

const useUpdateProfile = () => {
    const [isLoading, setLoading] = useState(false);
    const [isInvalidUpdate, setIsInvalidUpdate] = useState(false);
    const [cookies, setCookie] = useCookies(["username", "accessToken", "userId"]);
    const updatedFields = [];

    const VITE_USER_SERVICE_API = import.meta.env.VITE_USER_SERVICE_API || 'http://localhost/api/users';

    const handleUpdateProfile = async (username, email, password) => {
        setLoading(true);
        setIsInvalidUpdate(false);

        const updateData = {};
        if (username) {
            updateData.username = username;
            updatedFields.push("username");
        }
        if (email) { 
            updateData.email = email;
            updatedFields.push("email");
        }
        if (password) {
            updateData.password = password;
            updatedFields.push("password");
        }

        try {
            const response = await fetch(`${VITE_USER_SERVICE_API}/users/${cookies.userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${cookies.accessToken}`
                },
                body: JSON.stringify(updateData)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to register');
            }
            const data = await response.json();
            setLoading(false);
            setCookie("username", data["data"]["username"], { path: '/' });
            setCookie("userId", data["data"]["id"], { path: '/' });
            setCookie("email", data["data"]["email"], { path: '/' })
            console.log(data);
            console.log(`successfully updated ${email}`);
        } catch (error) {
            setIsInvalidUpdate(true);
            setLoading(false);
            console.log(error);
            alert(error);
        }
    }
    return {
        handleUpdateProfile,
        updatedFields,
        isLoading,
        isInvalidUpdate,
    };
}

export default useUpdateProfile;