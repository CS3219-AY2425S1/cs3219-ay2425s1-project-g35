import React, { useState } from 'react';

import { Link } from 'react-router-dom'

import styles from './LoginPage.module.css';
import useLogin from '../../hooks/useLogin';

const LoginPage = () => {
    const { handleLogin, isLoading, isInvalidLogin } = useLogin();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { email, password } = formData;
        if (!email || !password) {
            setErrorMessage('Please fill in both fields.');
            return;
        }
        handleLogin(email, password);
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.leftSection}>
                <h1 className={styles.appTitle}>PeerPrep</h1>
                <p className={styles.appSubtitle}>Sharpen your coding skills with others today!</p>
            </div>

            <div className={styles.rightSection}>
                <h2>Login</h2>
                <form onSubmit={handleSubmit} className={styles.loginForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Enter your email"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Enter your password"
                        />
                    </div>
                    {isLoading && <p>Loading...</p>}
                    {isInvalidLogin && <p className={styles.errorMessage}>Invalid login credentials, please try again.</p>}
                    {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
                    <button type="submit" className={styles.loginButton} disabled={isLoading}>
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <Link to={`/register`}> Register here </Link>
            </div>
        </div>
    );
};

export default LoginPage;
