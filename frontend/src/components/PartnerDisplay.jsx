import React from 'react';
import styles from './PartnerDisplay.module.css';

const PartnerDisplay = ({ partnerUsername, isConnected }) => {
    return (
        <div className={styles.container}>
            <span
                    className={`${styles.statusDot} ${isConnected ? styles.green : styles.red}`}
                ></span>
            <p>{partnerUsername ? `Partner: ${partnerUsername}` : "No partner matched yet."}</p>
        </div>
    );
}

export default PartnerDisplay;