var express = require('express');
const connectToDatabase = require("../db/conn");
var router = express.Router();

let db;
connectToDatabase().then(database => {
    db = database;
})

/* GET single question. */
router.get('/question', async (req, res, next) => {
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

module.exports = router;
