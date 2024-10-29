import { Navigate, Outlet } from 'react-router-dom';
import { useCookies } from "react-cookie";
import { useEffect, useState } from "react";

async function verifyUser(token) {
    try {
        console.log("Verifying user " + token);

        const response = await fetch('http://localhost:3001/auth/verify-token', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` // Include the token in the header if required
            },
        });
        if (!response.ok) {
            // If response is not OK, handle the error
            return false;
        }

        // const data = await response.json();

        // Sending the data from the API call as the response
        return true;
    } catch (error) {
        console.error("Error during authentication:", error);
        return false;
    }
}
const ProtectedRoute = () => {
    const [cookies] = useCookies(["accessToken", "userId"]);
    const [isVerified, setIsVerified] = useState(null);

    useEffect(() => {
        const checkUser = async () => {
            const result = await verifyUser(cookies.accessToken);
            setIsVerified(result);
        };
        checkUser();
    }, [cookies.accessToken]);

    if (isVerified === null) {
        return <div>Loading...</div>;
    }

    return isVerified
        ? <Outlet />
        : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
