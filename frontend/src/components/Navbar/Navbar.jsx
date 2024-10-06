import useLogout from '../../hooks/useLogout';
import styles from './Navbar.module.css'

const Navbar = () => {
    const { handleLogout } = useLogout();
    return (
        <div className={styles.Navbar}>
            <nav>
                <ul>
                </ul>
                <button onClick={() => { handleLogout() }}> Log out </button>
            </nav>
        </div>

    )
}
export default Navbar;