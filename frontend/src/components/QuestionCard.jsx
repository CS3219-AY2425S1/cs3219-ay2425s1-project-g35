import React from 'react';
import styles from './QuestionCard.module.css'

const QuestionCard = ({ question }) => {
  console.log(question);
  return (
    <div className={styles.questionCard}>
      <h2>ID: {question.questionID}</h2>
      <h3>Title: {question.questionTitle}</h3>
      <p>Description: {question.questionDescription}</p>
      <p>Difficulty: {question.questionComplexity}</p>
      <a href={question.link} target="_blank" rel="noopener noreferrer">
        View Problem
      </a>
    </div>
  );
};

export default QuestionCard;