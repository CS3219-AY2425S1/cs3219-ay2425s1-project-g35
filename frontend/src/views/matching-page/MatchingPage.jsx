import React, { useState } from 'react';
import styles from './MatchingPage.module.css';

const MatchingPage = () => {
    const [selectedDifficulty, setSelectedDifficulty] = useState('');
    const [selectedTopics, setSelectedTopics] = useState([]);

    const topics = [
        "Arrays",
        "Strings",
        "Trees",
        "Graphs",
        "Sorting",
        "Dynamic Programming",
        "Algorithms",
        "Data Structures",
        "Bit Manipulation",
        "Recursion",
        "Databases",
        "Brainteaser"
    ];

    const handleDifficultyClick = (difficulty) => {
        setSelectedDifficulty(difficulty);
    };

    const handleTopicClick = (topic) => {
        setSelectedTopics((prevSelectedTopics) => {
            if (prevSelectedTopics.includes(topic)) {
                return prevSelectedTopics.filter((t) => t !== topic); 
            } else {
                return [...prevSelectedTopics, topic]; 
            }
        });
    };

    const handleFindMatch = () => {
        if (!selectedDifficulty || selectedTopics.length === 0) {
            alert("Please select a difficulty and at least one topic.");
            return;
        }
        console.log("Finding match with:", selectedDifficulty, selectedTopics);
    };

    return (
        <div className={styles.matchingContainer}>
            <h1 className={styles.heading}>Start a new session</h1>

            <div className={styles.difficultySection}>
                <h3>Select Difficulty of Question</h3>
                <div className={styles.difficultyButtons}>
                    <button
                        className={`${styles.difficultyButton} ${selectedDifficulty === 'Easy' ? styles.selectedEasy : styles.notSelected}`}
                        onClick={() => handleDifficultyClick('Easy')}
                    >
                        Easy
                    </button>
                    <button
                        className={`${styles.difficultyButton} ${selectedDifficulty === 'Medium' ? styles.selectedMedium : styles.notSelected}`}
                        onClick={() => handleDifficultyClick('Medium')}
                    >
                        Medium
                    </button>
                    <button
                        className={`${styles.difficultyButton} ${selectedDifficulty === 'Hard' ? styles.selectedHard : styles.notSelected}`}
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
                            key={topic}
                            className={`${styles.topicButton} ${selectedTopics.includes(topic) ? styles.selected : ''}`}
                            onClick={() => handleTopicClick(topic)}
                        >
                            {topic}
                        </button>
                    ))}
                </div>
            </div>

            <button className={styles.findMatchButton} onClick={handleFindMatch}>
                Find a Match
            </button>
        </div>
    );
};

export default MatchingPage;
