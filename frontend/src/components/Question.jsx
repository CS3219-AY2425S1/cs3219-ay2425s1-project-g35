import { React } from 'react';
import styles from './Question.module.css';

const Question = ({ name, description, topics, leetcode_link, difficulty}) => {
    // todo: add styles

    const difficultyClass = 
        difficulty === "Easy" ? styles.easy : 
        difficulty === "Medium" ? styles.medium : 
        styles.hard;

    return (
        <div className={styles.QuestionDisplay}>
            <h2>{name}</h2>
            <p className={difficultyClass}>{difficulty}</p>
            <div className={styles.bubbleContainer}>
                    {topics.map((topic, index) => (
                        <div key={index} className={styles.bubble}>{topic}</div>
                    ))}
            </div>
            <p>{description}</p>
        </div>
    )
}

export default Question;