import React, { useState } from 'react';

import { Link } from 'react-router-dom'

import styles from './RegisterPage.module.css';
import useRegister from '../../hooks/useRegister';

const RegisterPage = () => {
    const { handleRegister, isLoading, isInvalidLogin } = useRegister();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Add simple validation
    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMessage('');
        const { username, email, password, confirmPassword } = formData;
        if (!username || !email || !password || !confirmPassword) {
            setErrorMessage('Please fill in all fields.');
            return;
        }
        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            return;
        }
        // Check for password length
        if (password.length < 8) {
            setErrorMessage('Password must be at least 8 characters long.');
            return;
        }
        handleRegister(username, email, password);
    };

    return (
        <div className={styles.registerContainer}>
            <div className={styles.leftSection}>
                <h1 className={styles.appTitle}>PeerPrep</h1>
                <p className={styles.appSubtitle}>Sharpen your coding skills with others today</p>
            </div>

            <div className={styles.rightSection}>
                <h2>Register</h2>
                <form onSubmit={handleSubmit} className={styles.registerForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            placeholder="Enter your username"
                        />
                    </div>
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
                    <div className={styles.formGroup}>
                        <label htmlFor="confirmPassword">Confirm Password:</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            placeholder="Confirm your password"
                        />
                    </div>
                    {isLoading && <p>Loading...</p>}
                    {isInvalidLogin && <p className={styles.errorMessage}>Invalid resgistration credentials, please try again.</p>}
                    {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
                    <button type="submit" className={styles.registerButton} >
                        {isLoading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                <Link to={`/cs3219-ay2425s1-project-g35/login`}> Login here </Link>
            </div>
        </div>
    );
};

export default RegisterPage;
