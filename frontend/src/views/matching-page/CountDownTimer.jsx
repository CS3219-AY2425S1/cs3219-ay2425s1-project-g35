import React, { useState, useEffect } from 'react';
import styles from './CountdownTimer.module.css'; 

const CountdownTimer = ({ initialSeconds, start }) => {
    const [seconds, setSeconds] = useState(initialSeconds);
    const [step, setStep] = useState(0);
    const icons = ['', '🖥️', '🖥️⏱️', '🖥️⏱️🕒'];

    useEffect(() => {
        if (!start || seconds <= 0) return;

        const intervalId = setInterval(() => {
            setSeconds((prevSeconds) => prevSeconds - 1);
        }, 1000);

        const iconIntervalId = setInterval(() => {
            setStep((prevStep) => (prevStep + 1) % icons.length);
        }, 1000);

        return () => {
            clearInterval(intervalId);
            clearInterval(iconIntervalId);
        };
    }, [start]);

    const animation = icons[step];

    return (
        <div className={styles.countDownContainer}>
            {seconds > 0 ? (
                <>
                    <h1>Finding a match {animation}</h1>
                    <h1>{seconds} seconds</h1>
                </>
            ) : (
                <h1>Time's up!</h1>
            )}
        </div>
    );
};

export default CountdownTimer;
