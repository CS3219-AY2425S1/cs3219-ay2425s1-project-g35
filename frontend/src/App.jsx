import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Navbar from './components/Navbar'

function App() {
  const [count, setCount] = useState(0)

  const [questions, setQuestions] = useState([]);

  const fetchQuestion = async () => {
    const data = await fetch('');

  }
  
  
  return (
    <>
      <Navbar/>
      
    </>
  )
}

export default App
