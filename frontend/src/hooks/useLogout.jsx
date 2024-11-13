import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie"; 

const useLogout = () => {
    const [cookies, setCookie, removeCookie] = useCookies(["accessToken", "userId", "email"]);
    const navigate = useNavigate();
    const handleLogout = () => {
        removeCookie("accessToken", { path: '/' });
        removeCookie("userId", { path: '/' });
        removeCookie("username", { path: '/' });
        removeCookie("email", { path: '/' })
        navigate("/login", { replace: true} );
    }

    return {
        handleLogout
    };
};

export default useLogout;