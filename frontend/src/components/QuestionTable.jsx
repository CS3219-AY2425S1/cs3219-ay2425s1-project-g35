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

  const formatString = (input) => {
    // Check if the input is an array or a string
    
    return input.replace(/[\[\]"]/g, ""); // Remove brackets and quotes from a string
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
              
              <tr key={question["Question ID"]}>
                <td>{question["Question ID"]}</td>
                <td>{question["Question Title"]}</td>
                <td>{formatString(question["Question Categories"])}</td>
                <td>
                  <p className={styles.complexity + ' ' + getComplexityClass(question["Question Complexity"])}>
                    {question["Question Complexity"]}
                  </p>
                </td>
                <td>
                  <a href={question["Link"]} target="_blank" rel="noopener noreferrer">
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
