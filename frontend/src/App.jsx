import { useState, useEffect } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import QuestionTable from './components/QuestionTable';

function App() {


  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('http://localhost:4000/questions');
        console.log(response);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log(data);
        setQuestions(data);
      } catch (error) {
        console.log(error);
      }
    }
    fetchQuestions();

  }, [])
  
  
  return (
    <>
      <Navbar/>
      <div className='question-list'>
          <QuestionTable questions={questions} />
      </div>
    </>
  )
}

export default App
