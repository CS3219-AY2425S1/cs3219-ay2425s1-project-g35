import useLogout from '../../hooks/useLogout';
import styles from './Navbar.module.css'
import { useCookies } from 'react-cookie';
import { useLocation } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

const Navbar = () => {
    const navigate = useNavigate();
    const { handleLogout } = useLogout();
    const [cookies] = useCookies(['username']); 
    const location = useLocation(); 
    const isInCollabRoom = location.pathname.startsWith('/collab/');

    const handleLogoutClick = () => {
        if (isInCollabRoom) {
            alert("You cannot log out while in a collaboration room. Leave the room first!"); // Alert if in collaboration room
        } else {
            handleLogout(); // Call the logout function
        }
    };

    const handleProfileClick = () => {
        if (isInCollabRoom) {
            alert("You cannot view profile while in a collaboration room. Leave the room first!"); // Alert if in collaboration room
        } else {
            navigate("/profile", { replace: true} );
        }
    };

    const handleMatchClick = () => {
        if (isInCollabRoom) {
            alert("You cannot view matching page while in a collaboration room. Leave the room first!"); // Alert if in collaboration room
        } else {
            navigate("/", { replace: true} );
        }
    };

    return (
        <div className={styles.nav}>
            <nav className={styles.navContent}>
                <div className={styles.navBrand} onClick={() => handleMatchClick()}>
                    PeerPrep
                </div>
                <div className={styles.navContainer}>
                    {cookies.username && (
                        <div className={styles.username}>
                            Hello, {cookies.username}
                        </div>
                    )}
                    <button className={styles.navButton} onClick={() => { handleMatchClick() }}>
                        Get Match
                    </button>
                    <button className={styles.navButton} onClick={() => { handleProfileClick() }}>
                        Profile
                    </button>
                    <button className={styles.navButton} onClick={() => { handleLogoutClick() }}>
                        Log out
                    </button>
                </div>
            </nav>
        </div>
    );
}

export default Navbar;