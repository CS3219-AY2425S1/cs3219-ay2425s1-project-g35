import useLogout from '../../hooks/useLogout';
import styles from './Navbar.module.css'

const Navbar = () => {
    const { handleLogout } = useLogout();
    return (
        <div className={styles.nav}>
            <nav>
                <button className={styles.button} onClick={() => { handleLogout() }}> Log out </button>
            </nav>
        </div>

    )
}
export default Navbar;