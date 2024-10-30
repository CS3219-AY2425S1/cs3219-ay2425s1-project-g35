import useLogout from '../../hooks/useLogout';
import styles from './Navbar.module.css'
import { useCookies } from 'react-cookie';
import { useLocation } from 'react-router-dom';


const Navbar = () => {
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

    return (
        <div className={styles.nav}>
            <nav className={styles.navContent}>
                <div className={styles.navBrand}>
                    PeerPrep
                </div>
                <div className={styles.navContainer}>
                    {cookies.username && (
                        <div className={styles.username}>
                            Hello, {cookies.username}
                        </div>
                    )}
                    <button className={styles.navButton} onClick={() => { handleLogoutClick() }}>
                        Log out
                    </button>
                </div>
            </nav>
        </div>
    );
}

export default Navbar;