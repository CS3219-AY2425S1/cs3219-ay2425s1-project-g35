import React, { useEffect, useState } from 'react';
import useMatcher from '../../hooks/useMatcher';
import styles from './MatchingPage.module.css';
import CountdownTimer from './CountDownTimer';
import { useCookies } from "react-cookie";

const MatchingPage = () => {
    const [cookies, setCookie] = useCookies(["accessToken", "userId"]);
    const [selectedDifficulty, setSelectedDifficulty] = useState('');
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [selectedFindingMatch, setSelectedFindingMatch] = useState(false);
    const [statusMessage, setStatusMessage] = useState("Start a new session now!"); // used for the right display

    const TIMEOUT = 60;
    const {
        isMatchSuccessful,
        timerStart,
        setTimerStart,
        enqueueUser,
        deleteUserFromQueue,
    } = useMatcher(cookies.userId);

    const topics = [
        { name: "Arrays", icon: "📊" },
        { name: "Strings", icon: "🔤" },
        { name: "Trees", icon: "🌳" },
        { name: "Graphs", icon: "🕸️" },
        { name: "Sorting", icon: "📈" },
        { name: "Dynamic Programming", icon: "🧠" },
        { name: "Algorithms", icon: "⚙️" },
        { name: "Data Structures", icon: "🏗️" },
        { name: "Bit Manipulation", icon: "🔢" },
        { name: "Recursion", icon: "🔄" },
        { name: "Databases", icon: "💾" },
        { name: "Brainteaser", icon: "🧩" }
    ];

    const handleDifficultyClick = (difficulty) => {
        setSelectedDifficulty(difficulty);
    };

    const handleTopicClick = (topic) => {
        setSelectedTopic(topic);
    };

    const handleFindMatch = () => {
        if (!selectedDifficulty || !selectedTopic) {
            alert("Please select a difficulty and at least one topic.");
            return;
        } else {
            setSelectedFindingMatch(!selectedFindingMatch);
            enqueueUser(selectedTopic, selectedDifficulty);
        }

        console.log("Finding match with:", selectedDifficulty, selectedTopic);
    };

    // Should be called when cancel button is pressed 
    const handleCancelMatch = () => {
        console.log('handleCancelMatch is called');
        deleteUserFromQueue(selectedTopic, selectedDifficulty);
        setSelectedFindingMatch(false); // stop finding a match
        setStatusMessage('You cancelled the matching. Please try again!')
    }

    useEffect(() => {
        console.log(`isMatchSuccessful: ${isMatchSuccessful}`);
        if (isMatchSuccessful === true) {
            setStatusMessage("Match found! Get ready!");
        } else if (isMatchSuccessful === false) {
            setStatusMessage("Search failed, please try again!");
        }
    }, [isMatchSuccessful]);

    return (
        <div className={styles.matchingPage}>
            <div className={styles.leftSection}>
                <div className={styles.matchingContainer}>
                    <h1 className={styles.heading}>Find Your Coding Buddy</h1>
                    <div className={styles.difficultySection}>
                        <h3>Select Difficulty of Question</h3>
                        <div className={styles.difficultyButtons}>
                            <button
                                className={`${styles.difficultyButton} ${selectedDifficulty === 'Easy' ? styles.selectedEasy : styles.notSelected}`}
                                disabled={selectedFindingMatch}
                                onClick={() => handleDifficultyClick('Easy')}
                            >
                                Easy
                            </button>
                            <button
                                className={`${styles.difficultyButton} ${selectedDifficulty === 'Medium' ? styles.selectedMedium : styles.notSelected}`}
                                disabled={selectedFindingMatch}
                                onClick={() => handleDifficultyClick('Medium')}
                            >
                                Medium
                            </button>
                            <button
                                className={`${styles.difficultyButton} ${selectedDifficulty === 'Hard' ? styles.selectedHard : styles.notSelected}`}
                                disabled={selectedFindingMatch}
                                onClick={() => handleDifficultyClick('Hard')}
                            >
                                Hard
                            </button>
                        </div>
                    </div>

                    <div className={styles.topicsSection}>
                        <h3>Select One or More Topics</h3>
                        <div className={styles.topicsContainer}>
                            {topics.map((topic) => (
                                <button
                                    key={topic.name}
                                    disabled={selectedFindingMatch}
                                    className={`${styles.topicButton} ${selectedTopic === topic.name ? styles.topicSelected : styles.topicNotSelected}`}
                                    onClick={() => handleTopicClick(topic.name)}
                                >
                                    <span className={styles.topicIcon}>{topic.icon}</span> {topic.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        className={`${styles.findMatchButton} ${selectedFindingMatch ? styles.findMatchButtonDisabled : styles.findMatchButton}`}
                        disabled={selectedFindingMatch}
                        onClick={handleFindMatch}>
                        Find a Match
                    </button>
                </div>
            </div>

            <div className={styles.rightSection}>
                {timerStart ? (
                    <>
                        <CountdownTimer initialSeconds={TIMEOUT} start={timerStart} />
                        <button
                            className={`${styles.findMatchButton}`}
                            disabled={!timerStart}
                            onClick={handleCancelMatch}>
                            Cancel Match
                        </button>
                    </>
                ) : (
                    <h2 className={styles.heading}>{statusMessage}</h2>
                )}
            </div>
        </div>
    );
};

export default MatchingPage;
