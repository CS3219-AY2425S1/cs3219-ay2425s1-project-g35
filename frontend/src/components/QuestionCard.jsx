import React from 'react';
import styles from './QuestionCard.module.css'

const QuestionCard = ({ question }) => {
  console.log(question);
  return (
    <div className={styles.questionCard}>
      <h2>ID: {question["Question ID"]}</h2>
      <h3>Title: {question["Question Title"]}</h3>
      <p>Description: {question["Question Description"]}</p>
      <p>Difficulty: {question["Question Complexity"]}</p>
      <a href={question["Link"]} target="_blank" rel="noopener noreferrer">
        View Problem
      </a>
    </div>
  );
};

export default QuestionCard;