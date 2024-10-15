import { Navigate, Outlet } from 'react-router-dom';
import { useCookies } from "react-cookie";

const ProtectedRoute = () => {
    const [cookies] = useCookies(["accessToken", "userId"]);
    return cookies.accessToken
        ? <Outlet />
        : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
