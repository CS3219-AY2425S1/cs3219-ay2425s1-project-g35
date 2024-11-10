import React, { useState, useEffect } from 'react';
import { useCookies } from "react-cookie";

import useProfile from '../../hooks/useProfile';
import useUpdateProfile from '../../hooks/useUpdateProfile';

import styles from './ProfilePage.module.css';

const ProfilePage = () => {
    const [numQuestions, setNumQuestions] = useState(0);
    const [expandedSessionId, setExpandedSessionId] = useState(null);
    const [codeSnippet, setCodeSnippet] = useState(null);
    const [sessionMap, setSessionMap] = useState(new Map());
    const [cookies] = useCookies(["username", "accessToken", "userId"]);
    const [activeLanguage, setActiveLanguage] = useState(null);

    const [newUsername, setNewUsername] = useState(null);
    const [newEmail, setNewEmail] = useState(null);
    const [newPassword, setNewPassword] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState('');

    const handleEditToggle = () => setIsEditing(!isEditing);

    const {
        username,
        email,
        history,
        createdAt,
        error,
        isLoading
    } = useProfile(cookies.userId);

    useEffect(() => {
        setNewUsername(username);
        setNewEmail(email);
    }, [username, email]);

    const { handleUpdateProfile, isLoading: isUpdating, isInvalidUpdate } = useUpdateProfile();

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!newUsername && !newEmail && !newPassword) {
            setMessage('Please fill in at least one field');
            return;
        }
        if (newPassword && newPassword.length < 8) {
            setMessage('Password must be at least 8 characters long.');
            return;
        }

        await handleUpdateProfile(newUsername, newEmail, newPassword);
        if (!isInvalidUpdate) {
            setMessage('Profile updated successfully');
            username = newUsername;
            email = newEmail;
            setNewUsername(null);
            setNewEmail(null);
            setNewPassword(null);
        } else {
            setMessage('Failed to update profile');
        }
    };

    const getCodeSnippet = (sessionId, language) => {
        const match = history.find(entry => entry.sessionId === sessionId && entry.language === language);
        if (match) {
            setCodeSnippet(match.codeSnippet);
        } else {
            setCodeSnippet(null);
        }
        console.log(codeSnippet);
    }

    const handleToggle = (sessionId) => {
        setExpandedSessionId(prevId => (prevId === sessionId ? null : sessionId));
        setActiveLanguage(null);
        setCodeSnippet(null);
        console.log(`handleToggle: sessionId: ${sessionId} active: ${activeLanguage}, expanded: ${expandedSessionId}`);
    };

    const handleLanguageSelect = (language) => {
        setActiveLanguage(language);
        getCodeSnippet(expandedSessionId, language);
    };

    useEffect(() => {
        const sortedHistory = [...history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        const map = new Map();
        sortedHistory.forEach(entry => {
            console.log(`getUniqueSessions: ${entry.sessionId} ${entry.questionId} ${entry.questionDescription} ${entry.timestamp}`);
            if (!map.has(entry.sessionId)) {
                map.set(entry.sessionId, [entry.questionId, entry.questionDescription, entry.timestamp]);
            }
        });

        setSessionMap(map);
        setNumQuestions(map.size);
    }, [username, email, createdAt, history]);

    if (isLoading) return <p>Loading...</p>;

    if (error) return <p> Error loading page. Please refresh </p>;

    return (
        <div className={styles.profilePage}>
            <div className={styles.profileContainer}>
                <div className={styles.profileHeader}>
                    <div className={styles.userDetails}>
                        <h2>Welcome back!</h2>
                        <p>@{username}</p>
                    </div>
                </div>
                <div className={styles.profileInfo}>
                    <div className={styles.infoBlock}>
                        <p>Email</p>
                        <strong>{email}</strong>
                    </div>
                    <div className={styles.infoBlock}>
                        <p>Questions Answered</p>
                        <strong>{numQuestions}</strong>
                    </div>
                    <div className={styles.infoBlock}>
                        <p>Member Since</p>
                        <strong>{new Date(createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</strong>
                    </div>
                </div>
            </div>

            {/* Edit Profile Section */}
            <button className={styles.editButton} onClick={handleEditToggle}>
                {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>

            {isEditing && (
                <form onSubmit={handleFormSubmit} className={styles.editForm}>
                    <div className={styles.formGroup}>
                        <label>Username</label>
                        <input
                            type="text"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Email</label>
                        <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className={styles.saveButton} disabled={isUpdating}>
                        {isUpdating ? 'Updating...' : 'Save Changes'}
                    </button>
                    {message && <p>{message}</p>}
                </form>
            )}

            <div className={styles.questionHistory}>
                <div>
                    <h2>Question History</h2>
                </div>
                <ul className={styles.questionList}>
                    {Array.from(sessionMap.entries()).map(([sessionId, [questionId, questionDescription, timestamp]], index) => (
                        <li key={index} className={styles.questionItem}>
                            <div className={styles.questionHeader} onClick={() => handleToggle(sessionId)}>
                                <span className={styles.label}>{questionId}</span>
                                <span>{new Date(timestamp).toLocaleDateString()}</span>
                                <span className={styles.toggleIcon}>
                                    {expandedSessionId === sessionId ? '▲' : '▼'}
                                </span>
                            </div>
                            {expandedSessionId === sessionId && (
                                <div className={styles.snippetContainer}>
                                    <div className={styles.questionDescription}>
                                        <div className={styles.label}>Description:</div>
                                        <div>{questionDescription}</div>
                                    </div>
                                    <div className={styles.tabContainer}>
                                        {[...new Set(history.filter(h => h.sessionId === sessionId).map(h => h.language))].map((language, index) => (
                                            <button
                                                key={index}
                                                className={`${styles.tabButton} ${activeLanguage === language ? styles.activeTab : ''}`}
                                                onClick={() => handleLanguageSelect(language)}
                                            >
                                                {language}
                                            </button>
                                        ))}
                                    </div>
                                    {codeSnippet && (
                                        <div className={styles.codeContainer}>
                                            <div key={index} className={styles.codeBlock}>
                                                <pre>
                                                    <code>{codeSnippet}</code>
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ProfilePage;
