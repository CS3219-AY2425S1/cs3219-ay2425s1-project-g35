import styles from './Navbar.module.css'

const Navbar = () => {
    return (
        <nav>
            <ul>
                <li>
                    Home
                </li>
                <li>
                    Settings
                </li>
            </ul>
            <button>Log out</button>
        </nav>
    )
}
export default Navbar;