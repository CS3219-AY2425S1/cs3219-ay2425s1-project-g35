import React, { useState } from 'react';
import styles from './MatchingPage.module.css';
import CountdownTimer from './CountDownTimer';

const MatchingPage = () => {
    const [selectedDifficulty, setSelectedDifficulty] = useState('');
    const [selectedTopics, setSelectedTopics] = useState([]);
    const [selectedFindingMatch, setSelectedFindingMatch] = useState(false);
    const [timerStart, setTimerStart] = useState(false);

    const TIMEOUT = 60;

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
        setSelectedTopics((prevSelectedTopics) => {
            if (prevSelectedTopics.includes(topic.name)) {
                return prevSelectedTopics.filter((t) => t !== topic.name);
            } else {
                return [...prevSelectedTopics, topic.name];
            }
        });
    };

    const handleFindMatch = () => {
        if (!selectedDifficulty || selectedTopics.length === 0) {
            alert("Please select a difficulty and at least one topic.");
            return;
        }
        setSelectedFindingMatch(!selectedFindingMatch);
        setTimerStart(!timerStart);

        console.log("Finding match with:", selectedDifficulty, selectedTopics);
    };

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
                                    className={`${styles.topicButton} ${selectedTopics.includes(topic.name) ? styles.topicSelected : styles.topicNotSelected}`}
                                    onClick={() => handleTopicClick(topic)}
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
                    <CountdownTimer initialSeconds={TIMEOUT} start={timerStart} />
                ) : (
                    <h2 className={styles.heading}>Start a new session now!</h2>
                )}
            </div>
        </div>
    );
};

export default MatchingPage;
