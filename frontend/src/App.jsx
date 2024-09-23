import { useState, useEffect } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import QuestionCard from './components/QuestionCard';

function App() {


  const [questions, setQuestions] = useState([]);

  const sampleData = [
    {
      questionID: 1,
      questionTitle: "Two Sum",
      questionDescription: "Given an array of integers, return indices of the two numbers such that they add up to a specific target.",
      questionCategories: ["Arrays", "Hash Map"],
      questionComplexity: "Easy",
      link: "https://leetcode.com/problems/two-sum/"
    },
    {
      questionID: 2,
      questionTitle: "Longest Substring Without Repeating Characters",
      questionDescription: "Given a string, find the length of the longest substring without repeating characters.",
      questionCategories: ["Strings", "Sliding Window"],
      questionComplexity: "Medium",
      link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/"
    },
    {
      questionID: 3,
      questionTitle: "Median of Two Sorted Arrays",
      questionDescription: "Given two sorted arrays, find the median of the two arrays.",
      questionCategories: ["Arrays", "Divide and Conquer"],
      questionComplexity: "Hard",
      link: "https://leetcode.com/problems/median-of-two-sorted-arrays/"
    },
    {
      questionID: 4,
      questionTitle: "Valid Parentheses",
      questionDescription: "Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
      questionCategories: ["Stack"],
      questionComplexity: "Easy",
      link: "https://leetcode.com/problems/valid-parentheses/"
    },
    {
      questionID: 5,
      questionTitle: "Merge Two Sorted Lists",
      questionDescription: "Merge two sorted linked lists and return it as a new sorted list.",
      questionCategories: ["Linked List", "Recursion"],
      questionComplexity: "Easy",
      link: "https://leetcode.com/problems/merge-two-sorted-lists/"
    },
    {
      questionID: 6,
      questionTitle: "Best Time to Buy and Sell Stock",
      questionDescription: "Find the maximum profit you can achieve by buying and selling a stock. You can only hold one share of stock at a time.",
      questionCategories: ["Array", "Dynamic Programming"],
      questionComplexity: "Easy",
      link: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/"
    },
    {
      questionID: 7,
      questionTitle: "Maximum Subarray",
      questionDescription: "Find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
      questionCategories: ["Array", "Divide and Conquer", "Dynamic Programming"],
      questionComplexity: "Medium",
      link: "https://leetcode.com/problems/maximum-subarray/"
    },
    {
      questionID: 8,
      questionTitle: "Climbing Stairs",
      questionDescription: "You are climbing a staircase. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
      questionCategories: ["Dynamic Programming"],
      questionComplexity: "Easy",
      link: "https://leetcode.com/problems/climbing-stairs/"
    },
    {
      questionID: 9,
      questionTitle: "Merge Intervals",
      questionDescription: "Given a collection of intervals, merge all overlapping intervals.",
      questionCategories: ["Array", "Sorting"],
      questionComplexity: "Medium",
      link: "https://leetcode.com/problems/merge-intervals/"
    },
    {
      questionID: 10,
      questionTitle: "Spiral Matrix",
      questionDescription: "Given an m x n matrix, return all elements of the matrix in spiral order.",
      questionCategories: ["Array"],
      questionComplexity: "Medium",
      link: "https://leetcode.com/problems/spiral-matrix/"
    },
    {
      questionID: 11,
      questionTitle: "Binary Tree Inorder Traversal",
      questionDescription: "Given the root of a binary tree, return its inorder traversal.",
      questionCategories: ["Binary Tree", "Recursion"],
      questionComplexity: "Easy",
      link: "https://leetcode.com/problems/binary-tree-inorder-traversal/"
    },
    {
      questionID: 12,
      questionTitle: "Maximum Depth of Binary Tree",
      questionDescription: "Given the root of a binary tree, return its maximum depth.",
      questionCategories: ["Binary Tree", "Recursion"],
      questionComplexity: "Easy",
      link: "https://leetcode.com/problems/maximum-depth-of-binary-tree/"
    }
  ];
  

  

  

  useEffect(() => {
    // const fetchQuestions = async () => {
    //   try {
    //     const response = await fetch('');
    //     if (!response.ok) {
    //       throw new Error('Network response was not ok');
    //     }
    //     const data = await response.json();
    //     setQuestions(data);
    //   } catch (error) {
    //     console.log(error);
    //   }
    // }
    // fetchQuestions();
    setQuestions(sampleData);
  }, [])
  
  
  return (
    <>
      <Navbar/>
      <div className='question-list'>
        <h1>Question List</h1>
          {questions.map((question) => (
            <QuestionCard key={question.questionID} question={question} />
          ))}
      </div>
    </>
  )
}

export default App
