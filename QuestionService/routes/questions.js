var express = require('express');
const connectToDatabase = require("../db/conn");
var router = express.Router();

const VITE_USER_SERVICE_API = 'http://user-service:3001' || 'http://localhost:3001';

let db;
connectToDatabase().then(database => {
    db = database;
})

const difficulties = ["Easy", "Medium", "Hard"];
/* Verify user's token */
async function verifyUser(token) {
    try {
        console.log("Verifying user " + token);

        const response = await fetch(`${VITE_USER_SERVICE_API}/auth/verify-token`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` // Include the token in the header if required
            },
        });

        if (!response.ok) {
            // If response is not OK, handle the error
            return false;
        }

        // const data = await response.json();

        // Sending the data from the API call as the response
        return true;
    } catch (error) {
        console.error("Error during authentication:", error);
        return false;
    }
}
/* GET single question. */
router.get('/question', async (req, res, next) => {
    const token = req.cookies.accessToken;
    if (!await verifyUser(token)) {
        return res.status(401).json({ message: "Authentication failed" });
    }
    console.log(req.query.questionId);
    const questionId = Number(req.query.questionId);
    if (isNaN(questionId)) {
        res.status(400).json({'error': 'Invalid Question ID'});
        return;
    }
    const collection = await db.collection('questions');
    const result = await collection.findOne({'Question ID': Number(req.query.questionId)});
    if (!result) {
        res.status(400).json({'error': 'Question Not Found'});
        return;
    }
    delete result['_id'];
    res.json(result);
});

/* GET multiple questions */
router.get('/questions', async (req, res, next) => {
    const token = req.cookies.accessToken;
    if (!await verifyUser(token)) {
        return res.status(401).json({ message: "Authentication failed" });
    }
    console.log(req.query.questionId);
    const topic = req.query.topic;
    const difficulty = req.query.difficulty;
    const collection = await db.collection('questions');
    const query = {};
    if (topic !== undefined) {
        query['Question Categories'] = topic; // Query based on topic
    }
    if (difficulty !== undefined) {
        query['Question Complexity'] = difficulty; // Query based on difficulty
    }

    let result = await collection.find(query, {_id: 0}).toArray();
    for (reslt of result) {
        delete reslt['_id'];
    }
    res.send(result);
});

/* GET a random question */
router.get('/question/random', async (req, res, next) => {

    const topic = req.query.topic;
    const difficulty = req.query.difficulty;
    const collection = await db.collection('questions');

    const query = {};
    if (topic !== undefined) {
        query['Question Categories'] = topic; // Query based on topic
    }
    if (difficulty !== undefined) {
        query['Question Complexity'] = difficulty; // Query based on difficulty
    }

    try {
        const questions = await collection.find(query).toArray();
        
        if (questions.length === 0) {
            return res.status(404).json({ error: 'No questions found' });
        }
        
        // Select a random question from the list
        const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
        delete randomQuestion['_id'];

        res.json(randomQuestion);
    } catch (error) {
        console.error("Error retrieving random question:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


/* POST add a question */
router.post('/question', async (req, res) => {
    const token = req.cookies.accessToken;
    if (!await verifyUser(token)) {
        return res.status(401).json({ message: "Authentication failed" });
    }
    const id = req.body.id;
    const name = req.body.name;
    const description = req.body.description;
    const topics = req.body.topics;
    const leetcode_link = req.body.leetcode_link;
    const difficulty = req.body.difficulty;

    // Check if request body is correctly filled
    if (id === undefined) {
        console.error('Error: id is required');
        res.status(400).json({'error': 'id is required'});
        return;
    }
    if (name === undefined || name === '') {
        console.error('Error: name is required');
        res.status(400).json({'error': 'name is required'});
        return;
    }
    if (description === undefined || description === '') {
        console.error('Error: description is required');
        res.status(400).json({'error': 'description is required'});
        return;
    }
    if (topics === undefined) {
        console.error('Error: topics are required');
        res.status(400).json({'error': 'topics are required'});
        return;
    }
    if (difficulty === undefined) {
        console.error('Error: difficulty is required');
        res.status(400).json({'error': 'difficulty is required'});
        return;
    }
    if (!difficulties.includes(difficulty)) {
        console.error('Error: Invalid Difficulty');
        res.status(400).json({'error': 'Invalid Difficulty'});
        return;
    }
    const collection = await db.collection('questions');

    // Check if a question with the same ID, Title or Description already exists
    const existing_questions = await collection.find({}).toArray();
    for (const question of existing_questions) {
        if (question['Question ID'] === id) {
            res.status(400).json({'error': 'Question ID already exists'});
            return;
        }
        if (question['Question Title'] === name) {
            res.status(400).json({'error': 'Question Title already exists'});
            return;
        }
        if (question['Question Description'] === description) {
            res.status(400).json({'error': 'Question Description already exists'});
            return;
        }
        if (leetcode_link !== undefined && question.Link === leetcode_link) {
            res.status(400).json({'error': 'Leetcode link already exists'});
            return;
        }
    }
    const new_question = {
        "Question ID": id,
        "Question Title": name,
        "Question Description": description,
        "Question Categories": topics,
        "Link": leetcode_link,
        "Question Complexity": difficulty,
    }
    const result = await collection.insertOne(new_question);
    res.json(result);
});

router.delete('/question/:questionId', async (req, res) => {
    const token = req.cookies.accessToken;
    if (!await verifyUser(token)) {
        return res.status(401).json({ message: "Authentication failed" });
    }
    const collection = await db.collection('questions');
    const questionId = Number(req.params.questionId);
    if (isNaN(questionId)) {
        res.status(400).json({'error': 'Invalid Question ID'});
        return;
    }
    const query = { 'Question ID': questionId };

    const result = await collection.deleteOne(query);

    // Check if successful deletion

    if (result.deletedCount === 1) {

        console.log("Successfully deleted one document.");
        res.status(200).json({'success': true});
        return;
    } else {

        console.log("No documents matched the query. Deleted 0 documents.");
        res.status(400).json({'success': false});
        return;
    }
});

router.patch('/question/:questionId', async (req, res) => {
    const token = req.cookies.accessToken;
    if (!await verifyUser(token)) {
        return res.status(401).json({ message: "Authentication failed" });
    }
    const questionId = Number(req.params.questionId);
    if (isNaN(questionId)) {
        res.status(400).json({'error': 'Invalid Question ID'});
        return;
    }
    const name = req.body.name;
    const description = req.body.description;
    const topics = req.body.topics;
    const leetcode_link = req.body.leetcode_link;
    const difficulty = req.body.difficulty;

    // Make sure question data is properly filled
    if (name === undefined || name === '' || description === undefined || description === '' ||
        topics === undefined || difficulty === undefined) {
        res.status(400).json({'error': 'Invalid Body'});
        return;
    }
    if (!difficulties.includes(difficulty)) {
        res.status(400).json({'error': 'Invalid Difficulty'});
        return;
    }
    const collection = await db.collection('questions');
    // Check if a question with that Question ID exists
    const query = { 'Question ID': questionId };
    const existing_question = await collection.findOne(query);
    if (!existing_question) {
        res.status(400).json({'error': 'Question Not Found'});
        return;
    }
    const id = existing_question['Question ID'];

    // Check if updating will create a duplicate of other questions
    const existing_questions = await collection.find({}).toArray();
    for (const question of existing_questions) {
        if (question['Question ID'] === id) { continue; }
        if (question['Question ID'] === id) {
            res.status(400).json({'error': 'Question ID already exists'});
            return;
        }
        if (question['Question Title'] === name) {
            res.status(400).json({'error': 'Question Title already exists'});
            return;
        }
        if (question['Question Description'] === description) {
            console.log("HERE " + id);
            res.status(400).json({'error': 'Question Description already exists'});
            return;
        }
        if (leetcode_link !== undefined && question.Link === leetcode_link) {
            res.status(400).json({'error': 'Leetcode link already exists'});
            return;
        }
    }
    const new_question = {
        "Question ID": id,
        "Question Title": name,
        "Question Description": description,
        "Question Categories": topics,
        "Link": leetcode_link,
        "Question Complexity": difficulty,
    }
    const result = await collection.replaceOne(query, new_question);
    res.json(result);
});
module.exports = router;
