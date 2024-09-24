import React from "react";
import styles from './QuestionTable.module.css'; // Import CSS Module

const QuestionTable = ({ questions }) => {
  const getComplexityClass = (complexity) => {
    switch (complexity) {
      case 'Easy':
        return styles.easy;
      case 'Medium':
        return styles.medium;
      case 'Hard':
        return styles.hard;
      default:
        return '';
    }
  };

  return (
    <div className={styles.questionTable}>
      <section className={styles.tableHeader}>
        <h1>Question List</h1>
      </section>
      <section className={styles.tableSection}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Id</th>
              <th>Question</th>
              <th>Categories</th>
              <th>Difficulty</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question) => (
              <tr key={question.questionID}>
                <td>{question.questionID}</td>
                <td>{question.questionTitle}</td>
                <td>{question.questionCategories.join(", ")}</td>
                <td>
                  <p className={styles.complexity + ' ' + getComplexityClass(question.questionComplexity)}>
                    {question.questionComplexity}
                  </p>
                </td>
                <td>
                  <a href={question.link} target="_blank" rel="noopener noreferrer">
                    View Problem
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default QuestionTable;
