import { useState, useEffect } from 'react'

function useQuestionTable() {
    const [questions, setQuestions] = useState([]);

    const fetchQuestions = async () => {
        try {
            const response = await fetch('https://3103.seewhyjay.dev/api/questions/questions', {credentials: "include"});
            console.log(response);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch questions');
            }
            const data = await response.json();
            data.sort((a, b) => a["Question ID"] - b["Question ID"]);
            setQuestions(data);
            console.log(data);
        } catch (error) {
            console.log(error);
            alert(error);
        }
    }

    useEffect(() => {
        fetchQuestions();
    }, [])

    const handleDelete = async (questionId) => {
        try {
            const response = await fetch(`https://3103.seewhyjay.dev/api/questions/question/${questionId}`, {
                method: 'DELETE', credentials: "include"
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch questions');
            }
            const data = await response.json();

            console.log(`successfully deleted question ${questionId}`);
            // refetch new question without deleted question
            fetchQuestions();

        } catch {
            console.log(error);
            alert(error);
        }
    }

    const handleCreate = async (questionId, questionName, questionDescription, questionTopics, link, questionDifficulty) => {
        try {
            const response = await fetch('https://3103.seewhyjay.dev/api/questions/question', {
                method: 'POST',
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json', // Indicate that the request body is JSON
                },
                body: JSON.stringify({
                    id: Number(questionId),
                    name: questionName,
                    description: questionDescription,
                    topics: questionTopics,
                    leetcode_link: link,
                    difficulty: questionDifficulty,
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch questions');
            }
            const data = await response.json();
            console.log(data);
            console.log(`successfully added question ${questionId}`);
            // refetch new question without deleted question
            fetchQuestions();
        } catch (error) {
            console.log(error);
            alert(error);
        }
    }

    const handleEdit = async (questionId, questionName, questionDescription, questionTopics, link, questionDifficulty) => {
        try {
            const response = await fetch(`https://3103.seewhyjay.dev/api/questions/question/${questionId}`, {
                method: 'PATCH',
                credetials: "include",
                headers: {
                    'Content-Type': 'application/json', // Indicate that the request body is JSON
                },
                body: JSON.stringify({
                    id: Number(questionId),
                    name: questionName,
                    description: questionDescription,
                    topics: questionTopics,
                    leetcode_link: link,
                    difficulty: questionDifficulty,
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to edit questions');
            }
            const data = await response.json();
            console.log(data);
            console.log(`successfully edited question ${questionId}`);
            // refetch new question with edited question
            fetchQuestions();
        } catch (error) {
            console.log(error);
            alert(error);
        }
    }

    return {
        questions,
        handleDelete,
        handleCreate,
        handleEdit
    };
}

export default useQuestionTable
