import useLogout from '../../hooks/useLogout';
import styles from './Navbar.module.css'

const Navbar = () => {
    const { handleLogout } = useLogout();
    return (
        <div className={styles.nav}>
            <nav className={styles.navContent}>
                <div className={styles.navBrand}>
                    PeerPrep
                </div>
                <button className={styles.navButton} onClick={() => { handleLogout() }}> 
                    Log out 
                </button>
            </nav>
        </div>
    );
}

export default Navbar;